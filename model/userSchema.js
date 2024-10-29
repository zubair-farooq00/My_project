// model/userSchema.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    post: [{
        content: { type: String },
        likes: { type: Number, default: 0 },
        comments: [{ type: String }]
    }],
    isVerified: {
        type: Boolean, 
        default: false 
    }
});

module.exports = mongoose.model("User", userSchema);
