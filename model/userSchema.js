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
        image: { type: String },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Store user IDs who liked the post
        comments: [{ type: String }]
    }],
    isVerified: {
        type: Boolean, 
        default: false 
    },
});

module.exports = mongoose.model("User", userSchema);
