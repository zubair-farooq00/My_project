// index.js
const express = require('express');
const mongoose = require('mongoose');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const authenticateUser = require('./middlewares/authMiddleware');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.get('/profile', authenticateUser, userController.getUserProfile);
app.patch('/user/update-profile/:userId', authenticateUser, userController.updateUser);
app.delete('/user/delete-profile/:userId', authenticateUser, userController.deleteUser);
// verification
app.get('/verify-email', authController.verifyEmail);


// Post creation
app.post('/user/create-post', authenticateUser, userController.createPost);

// Connect to MongoDB
const mongoDBURL = 'mongodb://localhost:27017/Social_Project';
mongoose.connect(mongoDBURL)
    .then(() => console.log("Connection Successful"))
    .catch((err) => console.log("Received an Error", err));

app.listen(4000, () => {
    console.log('Server is connected');
});
