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

export const deleteTransactionController = async (req, res) => {
  try {
    const { id: transactionId } = req.params;
    const { userId } = req.body;

    console.log("Received delete request for transaction:", transactionId);
    console.log("User ID received:", userId);

    if (!transactionId) {
      return res.status(400).json({ success: false, message: "Transaction ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Soft delete the transaction
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { isDeleted: true },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    return res.status(200).json({ success: true, message: "Transaction successfully deleted", transaction });
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

export const restoreTransactionController = async (req, res) => {
  try {
    const { transactionId, userId } = req.body;

    if (!transactionId || !userId) {
      return res.status(400).json({ success: false, message: "Transaction ID and User ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.isDeleted === false) {
      return res.status(404).json({ success: false, message: "Transaction not found or not deleted" });
    }

    // Restore the transaction
    transaction.isDeleted = false;
    await transaction.save();

    return res.status(200).json({ success: true, message: "Transaction restored successfully", transaction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
