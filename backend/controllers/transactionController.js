import Transaction from "../models/TransactionModel.js";
import User from "../models/UserSchema.js";
import moment from "moment";

// ✅ ADD TRANSACTION
export const addTransactionController = async (req, res) => {
  try {
    const { title, amount, description, date, category, userId, transactionType } = req.body;

    if (!title || !amount || !description || !date || !category || !transactionType) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newTransaction = await Transaction.create({
      title,
      amount,
      category,
      description,
      date,
      user: userId,
      transactionType,
    });

    user.transactions.push(newTransaction._id);
    await user.save(); // ✅ FIX: Ensure user is saved

    return res.status(201).json({ success: true, message: "Transaction Added Successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET ALL TRANSACTIONS
export const getAllTransactionController = async (req, res) => {
  try {
    const { email, type, startDate, endDate } = req.query; // ✅ Accept email, type, startDate, endDate

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // ✅ Find the user based on email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const query = { user: user._id }; // ✅ Use user._id

    if (type && type !== "all") {
      query.transactionType = type;
    }

    if (startDate && endDate) {
      query.date = { $gte: moment(startDate).toDate(), $lte: moment(endDate).toDate() };
    }

    const transactions = await Transaction.find(query);
    return res.status(200).json({ success: true, transactions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserIdByEmailController = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, userId: user._id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// Soft Delete (with automatic hard delete after timeout)
export const deleteTransactionController = async (req, res) => {
  try {
    const { id: transactionId } = req.params;
    const { userId } = req.body;

    console.log("Received soft delete request for transaction:", transactionId);
    console.log("User ID:", userId);

    if (!transactionId || !userId) {
      return res.status(400).json({ success: false, message: "Transaction ID and User ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Automatically hard delete after 30 seconds
    setTimeout(async () => {
      const checkTransaction = await Transaction.findById(transactionId);
      if (checkTransaction?.isDeleted) {
        await Transaction.findByIdAndDelete(transactionId);
        console.log("Transaction permanently deleted:", transactionId);
      }
    }, 30000); // 30 seconds

    return res.status(200).json({ success: true, message: "Transaction soft deleted. Undo available.", transaction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Restore Soft-Deleted Transaction (Undo Delete)
export const restoreTransactionController = async (req, res) => {
  try {
    const { transactionId, userId } = req.body;

    console.log("Undo delete request for transaction:", transactionId);

    if (!transactionId || !userId) {
      return res.status(400).json({ success: false, message: "Transaction ID and User ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction || !transaction.isDeleted) {
      return res.status(404).json({ success: false, message: "Transaction not found or not deleted" });
    }

    // Restore transaction
    transaction.isDeleted = false;
    transaction.deletedAt = null;
    await transaction.save();

    return res.status(200).json({ success: true, message: "Transaction restored successfully.", transaction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Hard Delete (Manually trigger)
export const hardDeleteTransactionController = async (req, res) => {
  try {
    const { id: transactionId } = req.params;

    console.log("Received hard delete request for transaction:", transactionId);

    if (!transactionId) {
      return res.status(400).json({ success: false, message: "Transaction ID is required" });
    }

    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      isDeleted: true, // Ensure only soft-deleted transactions are removed
    });

    if (!deletedTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found or already deleted" });
    }

    return res.status(200).json({ success: true, message: "Transaction permanently deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE TRANSACTION
export const updateTransactionController = async (req, res) => {
  try {
    const { id: transactionId } = req.params;
    const userId = req.query.userId || req.headers["userid"];

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId, req.body, {
      new: true,
    });

    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    return res.status(200).json({ success: true, message: "Transaction updated successfully", updatedTransaction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteMultipleTransactionsController = async (req, res) => {
  try {
    const { userId, transactionIds } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!transactionIds || transactionIds.length === 0) {
      return res.status(400).json({ success: false, message: "No transactions selected" });
    }

    console.log("Deleting transactions:", transactionIds);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Soft delete transactions
    await Transaction.updateMany(
      { _id: { $in: transactionIds } },
      { $set: { isDeleted: true } }
    );

    // Remove transactions from user's list
    user.transactions = user.transactions.filter(
      (t) => !transactionIds.includes(t.toString())
    );
    await user.save();

    return res.status(200).json({ success: true, message: "Transactions deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

