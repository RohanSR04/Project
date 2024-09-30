const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensure unique email addresses
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the date when the user is created
    },
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
