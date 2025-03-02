import express from 'express';
import { addTransactionController, deleteTransactionController, getAllTransactionController, updateTransactionController, getUserIdByEmailController,restoreTransactionController,
    deleteMultipleTransactionsController,
    hardDeleteTransactionController
  } from '../controllers/transactionController.js';

const router = express.Router();

router.route("/addTransaction").post(addTransactionController);

router.route("/getTransaction").get(getAllTransactionController);

router.route("/softDeleteTransaction/:id").put(deleteTransactionController);

router.route("/hardDeleteTransaction/:id").put(hardDeleteTransactionController);

router.route("/getUserId").all( getUserIdByEmailController);

router.route('/updateTransaction/:id').put(updateTransactionController);

router.route('/restoreTransaction').put(restoreTransactionController);

router.route('/deleteTransactions').delete(deleteMultipleTransactionsController);
export default router;