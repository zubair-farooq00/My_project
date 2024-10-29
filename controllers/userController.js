// controllers/userController.js
const User = require('../model/userSchema');

// Get user profile with posts
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: `Welcome, ${user.name}! Here is your profile data.`,
            user: {
                name: user.name,
                email: user.email,
                gender: user.gender,
                posts: user.post // Array of user's posts
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
};

// Update user fields
const updateUser = async (req, res) => {
    const { userId } = req.params; 
    
    if (req.user.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    const updateData = req.body; 
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

// Delete user field
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    if (req.user.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to update this user' });
    }
    try {
        const deletedUser = await User.findByIdAndDelete(userId, {
            new: true // Return updated document
        });

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};


// Create new post
const createPost = async (req, res) => {
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ message: "Post content is required" });
    }

    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const newPost = { content };
        user.post.push(newPost); // Add new post to user's post array
        await user.save();

        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
};



module.exports = { getUserProfile, updateUser, deleteUser, createPost };
