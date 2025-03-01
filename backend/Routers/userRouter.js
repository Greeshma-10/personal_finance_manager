import express from 'express';
import { 
    loginControllers, 
    registerControllers,  
    verifyTokenController,
    getUserController, // ✅ Import getUserController
    forgotPasswordController,
    resetPasswordByUsername
} from '../controllers/userController.js';
import { authenticateToken } from "../middlewares/authMiddleware.js"; // ✅ Import middleware

const router = express.Router();

router.post("/register", registerControllers);
router.post("/login", loginControllers);
router.get("/verifyToken", verifyTokenController);
router.get("/getUser", authenticateToken, getUserController); // ✅ Protect route
router.post("/forgot-password", forgotPasswordController);  // ✅ Send reset link
router.post("/reset-password-username", resetPasswordByUsername);  // ✅ Reset password
export default router;
