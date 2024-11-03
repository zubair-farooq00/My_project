// index.js
const express = require('express');
const mongoose = require('mongoose');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const authenticateUser = require('./middlewares/authMiddleware');

// Multer-------
const multer = require('multer');
const path = require('path');
// ------

const app = express();
app.use(express.json());
app.use(express.static('public'));

// User Crud 
app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.get('/profile', authenticateUser, userController.getUserProfile);
app.patch('/user/update-profile/:userId', authenticateUser, userController.updateUser);
app.delete('/user/delete-profile/:userId', authenticateUser, userController.deleteUser);
// verification
app.get('/verify-email', authController.verifyEmail);   

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Post creation Crud
app.post('/user/create-post', authenticateUser, upload.single('image'), userController.createPost);
app.get('/all-posts', authenticateUser, userController.getAllPosts);
app.delete('/user/delete-post/:index', authenticateUser, userController.deletePost);
app.patch('/user/update-post/:index', authenticateUser, userController.updatePost);

// like/dislike
app.post('/user/like-post/:creatorId/:postId', authenticateUser, userController.likePost);
app.post('/user/unlike-post/:creatorId/:postId', authenticateUser, userController.unlikePost);

// Forget password
app.post('/forgot-password', authController.forgotPassword);
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'resetPassword.html'));
});



// Connect to MongoDB
const mongoDBURL = 'mongodb://localhost:27017/Social_Project';
mongoose.connect(mongoDBURL)
    .then(() => console.log("Connection Successful"))
    .catch((err) => console.log("Received an Error", err));

app.listen(4000, () => {
    console.log('Server is connected');
});
