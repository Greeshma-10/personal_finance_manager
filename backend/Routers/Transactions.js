import express from 'express';
import { addTransactionController, deleteTransactionController, getAllTransactionController, updateTransactionController, getUserIdByEmailController,restoreTransactionController  } from '../controllers/transactionController.js';

const router = express.Router();

router.route("/addTransaction").post(addTransactionController);

router.route("/getTransaction").get(getAllTransactionController);

router.route("/deleteTransaction/:id").put(deleteTransactionController);

router.route("/getUserId").all( getUserIdByEmailController);

router.route('/updateTransaction/:id').put(updateTransactionController);

router.route('/restoreTransaction').put(restoreTransactionController);

export default router;