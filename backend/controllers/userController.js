import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export const verifyTokenController = (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; 
        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        // ✅ Wrap verification in try-catch
        try {
            const verified = jwt.verify(token, process.env.SECRET_KEY);
            return res.status(200).json({ valid: true, user: verified });
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export const registerControllers = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;

        // console.log(name, email, password);

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }) 
        }

        let user = await User.findOne({email});

        if(user){
            return res.status(409).json({
                success: false,
                message: "User already Exists",
            });
        }

        //preparing encrypted for storing db
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // console.log(hashedPassword);
        let newUser = await User.create({
            name, 
            email, 
            password: hashedPassword, 
        });

        return res.status(200).json({
            success: true,
            message: "User Created Successfully",
            user: newUser
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }

}
export const loginControllers = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password",
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email }, // Payload
            process.env.SECRET_KEY?.trim(),          // ✅ Trim any extra spaces
            { expiresIn: "1h" }                      // Token expiration
        );
        

        // ✅ Convert user object to plain JSON, then remove password
        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user: userData,
            token, // ✅ Send token to frontend
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
