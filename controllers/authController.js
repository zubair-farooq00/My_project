const User = require('../model/userSchema');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mySecretKey = 'zubair_farooq';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zubairfarooq688@gmail.com', 
        pass: 'qqjc svyi ylmk xhji'
    }
});

const signup = async (req, res) => {
    const { name, email, password, gender } = req.body;

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({
            name, 
            email, 
            password, 
            gender, 
            role: 'user', 
            post: [] 
        });
        await newUser.save();

        const verificationToken = jwt.sign({ userId: newUser._id }, mySecretKey, { expiresIn: '1h' });

        // Send verification email
        const verificationLink = `http://localhost:4000/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: 'zubairfarooq688@gmail.com',
            to: newUser.email,
            subject: 'Email Verification',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Verify Your Email</h2>
                <p>Thank you for signing up! Please verify your email by clicking the button below:</p>
                <a href="${verificationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Verify Email
                </a>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `,
    };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User signed up successfully. Please check your email to verify your account.' });
    } catch (error) {
        console.error("Error signing up user:", error);
        res.status(500).json({ message: 'Error signing up user', error });
    }
};

// Verify email endpoint
const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, mySecretKey);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isVerified = true;
        await user.save();
        

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired verification link', error });
    }
};


// User login 
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExist = await User.findOne({ email, password });

        if (!userExist) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if the user is verified
        if (!userExist.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        // Generate login token if user is verified
        const token = jwt.sign({ userId: userExist._id, name: userExist.name, role: userExist.role }, mySecretKey, { expiresIn: '1h' });
        return res.status(200).json({
            message: "User logged in successfully",
            token
        });

    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const crypto = require('crypto');

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        const resetLink = `http://localhost:4000/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: 'zubairfarooq688@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Reset Your Password</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Reset Password
                </a>
                <p>If you did not request this, please ignore this email.</p>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ message: 'Error in forgot password', error });
    }
};
const resetPassword = async (req, res) => {
    const { token } = req.query;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error in resetting password:", error);
        res.status(500).json({ message: 'Error in resetting password', error });
    }
};


module.exports = { signup, login, verifyEmail,forgotPassword,resetPassword };
