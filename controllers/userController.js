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
                posts: user.post 
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
            new: true 
        });

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};
const getAllPosts = async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;

        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }, 'name post'); 

        const allPosts = otherUsers.map(user => ({
            userName: user.name,
            posts: user.post
        }));

        res.status(200).json({
            message: "All other users' posts retrieved successfully",
            allPosts
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts from other users', error });
    }
};

// Create new post
const createPost = async (req, res) => {
    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; 
    
    if (!content) {
        return res.status(400).json({ message: "Post content is required" });
    }

    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const newPost = {
            content,
            image: imageUrl
        };

        user.post.push(newPost); 
        await user.save();

        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
};

  
// Update specific post by index
const updatePost = async (req, res) => {
    const { index } = req.params;
    const { content } = req.body; 

    if (!content) {
        return res.status(400).json({ message: "Updated post content is required" });
    }

    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (index < 0 || index >= user.post.length) {
            return res.status(404).json({ message: "Post not found" });
        }

        user.post[index].content = content;
        await user.save();

        res.status(200).json({ message: "Post updated successfully", post: user.post[index] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
    }
};

// Delete post section
const deletePost = async (req, res) => {
    const { index } = req.params;

    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (index < 0 || index >= user.post.length) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Remove the post at the specified index
        user.post.splice(index, 1);
        await user.save();

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
    }
};


//like and unlike

// Like a post by another user
const likePost = async (req, res) => {
    const { postId, creatorId } = req.params; // creatorId is the ID of the post owner
    const { userId } = req.user; // ID of the logged-in user
    
    try {
        const creator = await User.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ message: "Post owner not found" });
        }

        // Find the target post by its ID
        const post = creator.post.id(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user has already liked the post
        if (post.likedBy.includes(userId)) {
            return res.status(400).json({ message: "Post already liked" });
        }

        post.likes += 1;
        post.likedBy.push(userId);
        await creator.save();

        res.status(200).json({ message: "Post liked successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Error liking post", error });
    }
};

// Unlike a post by another user
const unlikePost = async (req, res) => {
    const { postId, creatorId } = req.params; // creatorId is the ID of the post owner
    const { userId } = req.user;

    try {
        const creator = await User.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ message: "Post owner not found" });
        }

        // Find the target post by its ID
        const post = creator.post.id(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user has liked the post
        const likeIndex = post.likedBy.indexOf(userId);
        if (likeIndex === -1) {
            return res.status(400).json({ message: "Post not yet liked" });
        }

        post.likes -= 1;
        post.likedBy.splice(likeIndex, 1);
        await creator.save();

        res.status(200).json({ message: "Post unliked successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Error unliking post", error });
    }
};

module.exports = { getUserProfile, updateUser, deleteUser, getAllPosts, createPost, deletePost, updatePost, likePost, unlikePost };
