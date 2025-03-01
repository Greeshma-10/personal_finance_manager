import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ✅ Get user details (Fix req.user issue)
export const getUserController = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY.trim());
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Verify token & return user details
export const verifyTokenController = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
        }

        const verified = jwt.verify(token, process.env.SECRET_KEY.trim());
        const user = await User.findById(verified.userId).select("-password");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// ✅ Register a new user & auto-login
export const registerControllers = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please enter all fields" });
        }

        let user = await User.findOne({ email });

        if (user) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({ name, email, password: hashedPassword });

        // Generate token after registration ✅
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.SECRET_KEY.trim(),
            { expiresIn: "7d" } // Increased expiry
        );

        return res.status(200).json({
            success: true,
            message: "User created successfully",
            user: { _id: newUser._id, name: newUser.name, email: newUser.email },
            token, // ✅ Auto-login token
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Login user & return token
export const loginControllers = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please enter all fields" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // ✅ Update lastLogin timestamp
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.SECRET_KEY.trim(),
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user: { _id: user._id, name: user.name, email: user.email },
            token,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Forgot Password - Send Reset Email
export const forgotPasswordController = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }

        // ✅ Find user by username
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Fetch last login timestamp dynamically
        const lastLoginTimestamp = user.lastLogin;

        // ✅ Generate a reset token including the last login timestamp
        const resetToken = jwt.sign(
            { userId: user._id, lastLogin: lastLoginTimestamp },
            process.env.SECRET_KEY.trim(),
            { expiresIn: "1h" }
        );

        // ✅ Return token to frontend (Since no email is used)
        return res.status(200).json({
            success: true,
            message: "Password reset token generated",
            resetToken,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Reset Password
// ✅ Reset Password
export const resetPasswordByUsername = async (req, res) => {
    try {
        const { username, newPassword } = req.body; // ✅ Use username instead of email

        if (!username || !newPassword) {
            return res.status(400).json({ success: false, message: "Invalid request" });
        }

        console.log("Received Username:", username);

        // ✅ Find user by name (because 'name' is the field in MongoDB)
        const user = await User.findOne({ name: { $regex: new RegExp("^" + username + "$", "i") } });

        console.log("Found User:", user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Hash and update password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successful!" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
