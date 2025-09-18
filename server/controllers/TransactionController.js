const { Transaction, User } = require("../models");
const midtransClient = require("midtrans-client");
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

class TransactionController {
  static async createTransaction(req, res, next) {
    try {
      const { parameter } = req.body;
      
      // Validate required parameter
      if (!parameter) {
        return res.status(400).json({
          message: "Parameter is required"
        });
      }

      // Validate parameter structure - check for required transaction_details
      if (!parameter.transaction_details || !parameter.transaction_details.order_id || !parameter.transaction_details.gross_amount) {
        return res.status(400).json({
          message: "Invalid parameter structure. transaction_details with order_id and gross_amount are required"
        });
      }
      
      // Logic to create a transaction
      const transaction = await snap.createTransaction(parameter);
      // transaction token
      let transactionToken = transaction.token;
      console.log("transactionToken:", transactionToken);
      
      res.status(200).json({
        message: "Transaction created successfully",
        token: transactionToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req, res, next) {
    try {
      const { userId, amount} = req.body;
      
      // Validate required fields
      if (!userId || !amount) {
        return res.status(400).json({
          message: "userId and amount are required"
        });
      }
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }
      
      const order = await Transaction.create({userId, amount,})
      
      let parameter = {
        transaction_details: {
          order_id: `ORDER-${order.providerOrderId}-${Math.round(new Date().getTime() / 1000)}`,
          gross_amount: order.amount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          id: user.id,
          user_name: user.fullName,
          email: user.email,
        },
      };
      res
        .status(200)
        .json({ message: "Order created successfully", parameter });
    } catch (error) {
      next(error);
    }
  }

  static async transactionNotification(req, res, next) {
    try {
      const notificationJson = req.body;
      const statusResponse = await snap.transaction.notification(
        notificationJson
      );
      const transactionStatus = statusResponse.transaction_status;
      
      // Check if transaction is successful (capture or settlement)
      if (transactionStatus !== "capture" && transactionStatus !== "settlement") {
        return res.status(400).json({ 
          message: "Transaction not successful", 
          transactionStatus 
        });
      }

      // If transaction is successful, update user to premium
      if (transactionStatus === "capture" || transactionStatus === "settlement") {
        // Extract order ID to find the associated transaction
        const orderId = statusResponse.order_id;
        
        // Find the transaction by parsing the order ID
        const orderIdParts = orderId.split('-');
        if (orderIdParts.length >= 2) {
          const providerOrderId = orderIdParts[1];
          
          // Validate UUID format before database query
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(providerOrderId)) {
            const transaction = await Transaction.findOne({
              where: { providerOrderId: providerOrderId }
            });
            
            if (transaction) {
              // Update user to premium status
              await User.update(
                { isPremium: true },
                { where: { id: transaction.userId } }
              );
            }
          }
        }
      }
      
      res.status(200).json({ message: "Notification received", transactionStatus });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;
