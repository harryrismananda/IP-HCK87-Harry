const { Transaction, User } = require("../models");
const midtransClient = require("midtrans-client");
let snap = new midtransClient.Snap({
  isProduction: false, // Try sandbox mode first
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
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
      
      const order = await Transaction.create({
        userId, 
        amount
        // providerOrderId will be auto-generated as UUID
      });
      
      // Create shorter order_id - use the generated UUID prefix
      const shortOrderId = `ORD-${order.id}-${Date.now().toString().slice(-6)}`;
      
      let parameter = {
        transaction_details: {
          order_id: shortOrderId,
          gross_amount: order.amount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          id: user.id,
          user_name: user.fullName,
          first_name: user.fullName,
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

    const statusResponse = await snap.transaction.notification(notificationJson);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `📩 Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
    );

    // Sample transactionStatus handling logic
    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        // ✅ set transaction status on your database to 'success'
        const transaction = await Transaction.update(
          { status: "success" },
          { where: { providerOrderId: orderId } }
        );
        await User.update({ isPremium: true }, { where: { id: transaction.userId } });
        return res.json({ message: `Transaction ${fraudStatus}` });
      }
    } else if (transactionStatus === "settlement") {
      const transaction = await Transaction.update(
        { status: "success" },
        { where: { providerOrderId: orderId } }
      );
      await User.update({ isPremium: true }, { where: { id: transaction.userId } });
      return res.json({ message: `Transaction ${fraudStatus}` });
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      await Transaction.update(
        { status: "failure" },
        { where: { providerOrderId: orderId } }
      );
      return res.json({ message: `Transaction ${fraudStatus}` });
    } else if (transactionStatus === "pending") {
      await Transaction.update(
        { status: "pending" },
        { where: { providerOrderId: orderId } }
      );
      return res.json({ message: `Transaction ${fraudStatus}` });
    }

    // If no branch matched, still acknowledge Midtrans
    return res.json({ message: "Notification received" });
  } catch (error) {
    // console.error("❌ Midtrans notification error:", error);
    // Important: Still return 200 so Midtrans doesn’t retry endlessly
    return res.status(200).json({
      message: "Notification received but error occurred",
      error: error.message,
    });
  }
  }
  // static async transactionNotification(req, res, next) {
  //   try {
  //     const notificationJson = req.body;
      
  //     // Validate notification data
  //     if (!notificationJson || Object.keys(notificationJson).length === 0) {
  //       return res.status(500).json({ 
  //         message: "Invalid notification data" 
  //       });
  //     }
      
  //     // Check if order_id exists in notification
  //     if (!notificationJson.order_id) {
  //       return res.status(500).json({ 
  //         message: "Missing order_id in notification" 
  //       });
  //     }
      
  //     const statusResponse = await snap.transaction.notification(
  //       notificationJson
  //     );
      
  //     // Use transaction status from notification data first, fallback to statusResponse
  //     const transactionStatus = notificationJson.transaction_status || statusResponse.transaction_status;
      
  //     // Check if transaction is failed, denied, expired, cancelled or pending - reject these
  //     const failedStatuses = ['failed', 'deny', 'expire', 'cancel', 'pending'];
  //     if (failedStatuses.includes(transactionStatus)) {
  //       return res.status(400).json({ 
  //         message: "Transaction not successful", 
  //         transactionStatus 
  //       });
  //     }

  //     // If transaction is successful, update user to premium
  //     if (transactionStatus === "capture" || transactionStatus === "settlement") {
  //       // Extract order ID to find the associated transaction
  //       const orderId = notificationJson.order_id || statusResponse.order_id;
        
  //       // Find the transaction by parsing the order ID (format: ORD-{id}-{timestamp})
  //       const orderIdParts = orderId.split('-');
  //       if (orderIdParts.length >= 2) {
  //         const transactionId = parseInt(orderIdParts[1]);
          
  //         // Find transaction by numeric ID
  //         if (!isNaN(transactionId)) {
  //           const transaction = await Transaction.findByPk(transactionId);
            
  //           if (transaction) {
  //             // Update user to premium status
  //             await User.update(
  //               { isPremium: true },
  //               { where: { providerOrderId: id: transaction.userId } }
  //             );
  //           }
  //         }
  //       }
  //     }
      
  //     res.status(200).json({ message: "Notification received", transactionStatus });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}

module.exports = TransactionController;
