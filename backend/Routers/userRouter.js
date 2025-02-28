import express from 'express';
import { 
    loginControllers, 
    registerControllers, 
     
    verifyTokenController // ✅ Import verifyTokenController
} from '../controllers/userController.js';

const router = express.Router();

router.route("/register").post(registerControllers);
router.route("/login").post(loginControllers);
router.get("/verifyToken", verifyTokenController); // ✅ Use the controller

export default router;
