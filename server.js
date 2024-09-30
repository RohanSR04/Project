const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // Import mongoose

const app = express();
const students = require('./data/students_data.json');
const classes = require('./data/classes_data.json');
const grades = require('./data/grades_data.json');

// MongoDB connection
mongoose.connect('mongodb+srv://braveanshu2004:TltS2XTFFEHpucja@cluster0.2blvb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: 'your_secret_key', // Change this to a secure key
    resave: false,
    saveUninitialized: true,
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// User Model
const User = mongoose.model('User', new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}));

// User Registration Endpoint
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password and store the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

    try {
        await newUser.save(); // Save the user to the database
        req.session.user = email; // Store user's email in session
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving user' });
    }
});

// User Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Store user session
    req.session.user = user.email; // Store user's email in session
    res.status(200).json({ message: 'Login successful' });
});

// User Logout Endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

// Check if user is logged in
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ message: 'User is logged in' });
    } else {
        res.status(401).json({ message: 'User is not logged in' });
    }
});

// Serve signup page (registration.html) on root URL
app.get('/', (req, res) => {
    console.log("Serving signup page...");
    res.sendFile(path.join(__dirname, 'public', 'registration.html')); // Serve registration.html on root URL
});

// API Endpoint for fetching all students
app.get('/students', (req, res) => {
    res.json(students);
});

// API Endpoint for fetching a single student by ID
app.get('/students/:id', (req, res) => {
    const student = students.students.find(s => s.student_id === req.params.id);
    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
});

// API Endpoint for fetching all classes
app.get('/classes', (req, res) => {
    res.json(classes);
});

// API Endpoint for fetching a single class by ID
app.get('/classes/:id', (req, res) => {
    const classData = classes.classes.find(c => c.class_id === req.params.id);
    if (classData) {
        res.json(classData);
    } else {
        res.status(404).json({ message: 'Class not found' });
    }
});

// API Endpoint for fetching all grades
app.get('/grades', (req, res) => {
    res.json(grades);
});

// API Endpoint for fetching grades by student ID
app.get('/grades/:student_id', (req, res) => {
    const studentGrades = grades.grades.filter(g => g.student_id === req.params.student_id);
    if (studentGrades.length > 0) {
        res.json(studentGrades);
    } else {
        res.status(404).json({ message: 'No grades found for this student' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
