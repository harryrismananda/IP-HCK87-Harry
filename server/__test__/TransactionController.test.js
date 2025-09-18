const request = require('supertest');
const app = require('../app');
const { Transaction, User } = require('../models');
const { generateToken } = require('../helpers/jwt');

// Mock midtrans-client
jest.mock('midtrans-client', () => {
  return {
    Snap: jest.fn().mockImplementation(() => ({
      createTransaction: jest.fn().mockResolvedValue({
        token: 'mock-transaction-token-12345',
        redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-token'
      }),
      transaction: {
        notification: jest.fn().mockResolvedValue({
          transaction_status: 'capture',
          order_id: 'ORDER-123-456789',
          gross_amount: '50000.00',
          payment_type: 'credit_card',
          fraud_status: 'accept'
        })
      }
    }))
  };
});

describe('TransactionController', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create test user for authentication
    testUser = await User.create({
      email: 'transaction@example.com',
      password: 'password123',
      fullName: 'Transaction Test User',
      role: 'admin',
      isPremium: false
    });
    authToken = generateToken({ id: testUser.id });
  });

  beforeEach(async () => {
    // Clean up transactions before each test
    await Transaction.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  });

  afterAll(async () => {
    // Clean up all test data
    await Transaction.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  });

  describe('POST /transactions/create-order', () => {
    it('should create order successfully', async () => {
      const orderData = {
        userId: testUser.id,
        amount: 50000
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Order created successfully');
      expect(response.body).toHaveProperty('parameter');
      expect(response.body.parameter).toHaveProperty('transaction_details');
      expect(response.body.parameter).toHaveProperty('customer_details');
      expect(response.body.parameter.transaction_details).toHaveProperty('gross_amount', 50000);
      expect(response.body.parameter.customer_details).toHaveProperty('id', testUser.id);
      expect(response.body.parameter.customer_details).toHaveProperty('user_name', testUser.fullName);
      expect(response.body.parameter.customer_details).toHaveProperty('email', testUser.email);

      // Verify order was created in database
      const createdOrder = await Transaction.findOne({ where: { userId: testUser.id } });
      expect(createdOrder).toBeTruthy();
      expect(createdOrder.amount).toBe(50000);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentUserId = 99999;
      const orderData = {
        userId: nonExistentUserId,
        amount: 50000
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for missing authentication', async () => {
      const orderData = {
        userId: testUser.id,
        amount: 50000
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .send(orderData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        userId: testUser.id
        // missing amount
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect([400, 500]);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle different amount values', async () => {
      const orderData = {
        userId: testUser.id,
        amount: 100000
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(200);

      expect(response.body.parameter.transaction_details.gross_amount).toBe(100000);
    });
  });

  describe('POST /transactions/create-transaction', () => {
    it('should create transaction successfully with valid parameter', async () => {
      const transactionData = {
        parameter: {
          transaction_details: {
            order_id: 'ORDER-123-456789',
            gross_amount: 50000
          },
          credit_card: {
            secure: true
          },
          customer_details: {
            id: testUser.id,
            user_name: testUser.fullName,
            email: testUser.email
          }
        }
      };

      const response = await request(app)
        .post('/transactions/create-transaction')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Transaction created successfully');
      expect(response.body).toHaveProperty('token', 'mock-transaction-token-12345');
    });

    it('should return 401 for missing authentication', async () => {
      const transactionData = {
        parameter: {
          transaction_details: {
            order_id: 'ORDER-123-456789',
            gross_amount: 50000
          }
        }
      };

      const response = await request(app)
        .post('/transactions/create-transaction')
        .send(transactionData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle missing parameter field', async () => {
      const response = await request(app)
        .post('/transactions/create-transaction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect([400, 500]);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid parameter structure', async () => {
      const invalidTransactionData = {
        parameter: {
          // Missing required fields
          invalid_field: 'invalid_value'
        }
      };

      const response = await request(app)
        .post('/transactions/create-transaction')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTransactionData)
        .expect([400, 500]);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /transactions/transaction-status', () => {
    it('should handle successful transaction notification and update user to premium', async () => {
      // First create an order to have a valid transaction
      const orderData = {
        userId: testUser.id,
        amount: 50000
      };

      const orderResponse = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      const createdTransaction = await Transaction.findOne({ where: { userId: testUser.id } });
      
      const notificationData = {
        transaction_time: '2025-09-18 10:30:00',
        transaction_status: 'capture',
        transaction_id: '12345-67890-abcdef',
        status_message: 'midtrans payment notification',
        status_code: '200',
        signature_key: 'signature_from_midtrans',
        payment_type: 'credit_card',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        merchant_id: 'merchant_id',
        gross_amount: '50000.00',
        fraud_status: 'accept',
        currency: 'IDR'
      };

      // Mock the notification response to match our order
      const midtransClient = require('midtrans-client');
      const mockSnap = new midtransClient.Snap();
      mockSnap.transaction.notification.mockResolvedValueOnce({
        transaction_status: 'capture',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        gross_amount: '50000.00',
        payment_type: 'credit_card',
        fraud_status: 'accept'
      });

      const response = await request(app)
        .post('/transactions/transaction-status')
        .send(notificationData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification received');
      expect(response.body).toHaveProperty('transactionStatus', 'capture');

      // Verify user is now premium
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.isPremium).toBe(true);
    });

    it('should handle settlement transaction notification and update user to premium', async () => {
      // First create an order to have a valid transaction
      const orderData = {
        userId: testUser.id,
        amount: 75000
      };

      await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      const createdTransaction = await Transaction.findOne({ where: { userId: testUser.id } });

      // Mock settlement status
      const midtransClient = require('midtrans-client');
      const mockSnap = new midtransClient.Snap();
      mockSnap.transaction.notification.mockResolvedValueOnce({
        transaction_status: 'settlement',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        gross_amount: '75000.00',
        payment_type: 'bank_transfer',
        fraud_status: 'accept'
      });

      const notificationData = {
        transaction_time: '2025-09-18 10:30:00',
        transaction_status: 'settlement',
        transaction_id: '12345-67890-abcdef',
        status_message: 'midtrans payment notification',
        status_code: '200',
        signature_key: 'signature_from_midtrans',
        payment_type: 'bank_transfer',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        merchant_id: 'merchant_id',
        gross_amount: '75000.00',
        fraud_status: 'accept',
        currency: 'IDR'
      };

      const response = await request(app)
        .post('/transactions/transaction-status')
        .send(notificationData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification received');
      expect(response.body).toHaveProperty('transactionStatus', 'settlement');

      // Verify user is now premium
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.isPremium).toBe(true);
    });

    it('should reject failed transaction notifications', async () => {
      // First create an order to have a valid transaction
      const orderData = {
        userId: testUser.id,
        amount: 50000
      };

      const orderResponse = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      const createdTransaction = await Transaction.findOne({ where: { userId: testUser.id } });
      
      // Mock failed transaction
      const midtransClient = require('midtrans-client');
      const mockSnap = new midtransClient.Snap();
      mockSnap.transaction.notification.mockResolvedValueOnce({
        transaction_status: 'deny',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        gross_amount: '50000.00',
        payment_type: 'credit_card',
        fraud_status: 'deny'
      });

      const notificationData = {
        transaction_time: '2025-09-18 10:30:00',
        transaction_status: 'deny',
        transaction_id: '12345-67890-abcdef',
        status_message: 'midtrans payment notification',
        status_code: '400',
        signature_key: 'signature_from_midtrans',
        payment_type: 'credit_card',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        merchant_id: 'merchant_id',
        gross_amount: '50000.00',
        fraud_status: 'deny',
        currency: 'IDR'
      };

      const response = await request(app)
        .post('/transactions/transaction-status')
        .send(notificationData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      
      // Verify user is still not premium
      const user = await User.findByPk(testUser.id);
      expect(user.isPremium).toBe(false);
    });

    it('should reject pending transaction notifications', async () => {
      // First create an order to have a valid transaction
      const orderData = {
        userId: testUser.id,
        amount: 50000
      };

      const orderResponse = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      const createdTransaction = await Transaction.findOne({ where: { userId: testUser.id } });
      
      // Mock pending transaction
      const midtransClient = require('midtrans-client');
      const mockSnap = new midtransClient.Snap();
      mockSnap.transaction.notification.mockResolvedValueOnce({
        transaction_status: 'pending',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        gross_amount: '50000.00',
        payment_type: 'bank_transfer',
        fraud_status: 'accept'
      });

      const notificationData = {
        transaction_time: '2025-09-18 10:30:00',
        transaction_status: 'pending',
        transaction_id: '12345-67890-abcdef',
        status_message: 'midtrans payment notification',
        status_code: '201',
        signature_key: 'signature_from_midtrans',
        payment_type: 'bank_transfer',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        merchant_id: 'merchant_id',
        gross_amount: '50000.00',
        fraud_status: 'accept',
        currency: 'IDR'
      };

      const response = await request(app)
        .post('/transactions/transaction-status')
        .send(notificationData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      
      // Verify user is still not premium
      const user = await User.findByPk(testUser.id);
      expect(user.isPremium).toBe(false);
    });

    it('should handle malformed notification data', async () => {
      const invalidNotificationData = {
        invalid_field: 'invalid_value'
      };

      const response = await request(app)
        .post('/transactions/transaction-status')
        .send(invalidNotificationData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle empty notification body', async () => {
      const response = await request(app)
        .post('/transactions/transaction-status')
        .send({})
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle midtrans API errors', async () => {
      // Mock Midtrans API error
      const midtransClient = require('midtrans-client');
      const mockSnap = new midtransClient.Snap();
      mockSnap.transaction.notification.mockRejectedValueOnce(new Error('Midtrans API error'));

      const notificationData = {
        transaction_time: '2025-09-18 10:30:00',
        transaction_status: 'capture',
        transaction_id: '12345-67890-abcdef',
        order_id: 'ORDER-123-1695807600',
        gross_amount: '50000.00'
      };

      const response = await request(app)
        .post('/transactions/transaction-status')
        .send(notificationData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Authentication and Authorization Tests', () => {
    it('should handle missing Authorization header gracefully', async () => {
      const response = await request(app)
        .post('/transactions/create-order')
        .send({ userId: testUser.id, amount: 50000 })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid token format', async () => {
      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', 'InvalidToken')
        .send({ userId: testUser.id, amount: 50000 })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle malformed Authorization header', async () => {
      const response = await request(app)
        .post('/transactions/create-transaction')
        .set('Authorization', 'Bearer ')
        .send({ parameter: {} })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large amount values', async () => {
      const orderData = {
        userId: testUser.id,
        amount: 999999999
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(200);

      expect(response.body.parameter.transaction_details.gross_amount).toBe(999999999);
    });

    it('should handle zero amount', async () => {
      const orderData = {
        userId: testUser.id,
        amount: 0
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect([200, 400, 500]);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle negative amount', async () => {
      const orderData = {
        userId: testUser.id,
        amount: -50000
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect([200, 400, 500]);

      expect(response.body).toHaveProperty('message');
    });

    it('should generate unique order IDs', async () => {
      const orderData1 = {
        userId: testUser.id,
        amount: 50000
      };

      const orderData2 = {
        userId: testUser.id,
        amount: 75000
      };

      const response1 = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData1)
        .expect(200);

      const response2 = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData2)
        .expect(200);

      expect(response1.body.parameter.transaction_details.order_id)
        .not.toBe(response2.body.parameter.transaction_details.order_id);
    });

    it('should handle transaction notification with different payment types', async () => {
      const paymentTypes = ['credit_card', 'bank_transfer', 'echannel', 'gopay'];
      
      for (const paymentType of paymentTypes) {
        // Create a new order for each payment type
        const orderData = {
          userId: testUser.id,
          amount: 50000
        };

        const orderResponse = await request(app)
          .post('/transactions/create-order')
          .set('Authorization', `Bearer ${authToken}`)
          .send(orderData);

        const createdTransaction = await Transaction.findOne({ 
          where: { userId: testUser.id },
          order: [['createdAt', 'DESC']]
        });
        
        const notificationData = {
          transaction_time: '2025-09-18 10:30:00',
          transaction_status: 'capture',
          transaction_id: `12345-67890-${paymentType}`,
          payment_type: paymentType,
          order_id: `ORDER-${createdTransaction.providerOrderId}-${paymentType}`,
          gross_amount: '50000.00',
          fraud_status: 'accept'
        };

        const response = await request(app)
          .post('/transactions/transaction-status')
          .send(notificationData)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Notification received');
      }
    });
  });

  describe('Data Validation and Integrity', () => {
    it('should include all required transaction details in response', async () => {
      const orderData = {
        userId: testUser.id,
        amount: 50000
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(200);

      const parameter = response.body.parameter;
      
      // Verify transaction details
      expect(parameter.transaction_details).toHaveProperty('order_id');
      expect(parameter.transaction_details).toHaveProperty('gross_amount');
      
      // Verify credit card settings
      expect(parameter.credit_card).toHaveProperty('secure', true);
      
      // Verify customer details
      expect(parameter.customer_details).toHaveProperty('id');
      expect(parameter.customer_details).toHaveProperty('user_name');
      expect(parameter.customer_details).toHaveProperty('email');
    });

    it('should maintain transaction consistency in database', async () => {
      const orderData = {
        userId: testUser.id,
        amount: 50000
      };

      const response = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(200);

      // Verify transaction was properly saved
      const savedTransaction = await Transaction.findOne({ 
        where: { userId: testUser.id } 
      });
      
      expect(savedTransaction).toBeTruthy();
      expect(savedTransaction.userId).toBe(testUser.id);
      expect(savedTransaction.amount).toBe(50000);
      expect(savedTransaction).toHaveProperty('providerOrderId');
    });

    it('should properly validate transaction notification structure', async () => {
      // First create an order to have a valid transaction
      const orderData = {
        userId: testUser.id,
        amount: 50000
      };

      const orderResponse = await request(app)
        .post('/transactions/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      const createdTransaction = await Transaction.findOne({ where: { userId: testUser.id } });
      
      const validNotificationData = {
        transaction_time: '2025-09-18 10:30:00',
        transaction_status: 'capture',
        transaction_id: '12345-67890-abcdef',
        status_message: 'midtrans payment notification',
        status_code: '200',
        signature_key: 'signature_from_midtrans',
        payment_type: 'credit_card',
        order_id: `ORDER-${createdTransaction.providerOrderId}-1695807600`,
        merchant_id: 'merchant_id',
        gross_amount: '50000.00',
        fraud_status: 'accept',
        currency: 'IDR'
      };

      const response = await request(app)
        .post('/transactions/transaction-status')
        .send(validNotificationData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification received');
      expect(response.body).toHaveProperty('transactionStatus');
      expect(['capture', 'settlement']).toContain(response.body.transactionStatus);
    });
  });
});