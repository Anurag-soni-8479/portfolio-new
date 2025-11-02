const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS - Allow Localhost (5500 + 5501) + GitHub Pages
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501',  // Tera current port
        'http://localhost:5500',
        'http://localhost:5501',
        'https://anurag-soni-8479.github.io',  // Tera GitHub Pages
        'https://anurag-soni-8479.github.io/portfolio-new'  // Agar subfolder hai
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false
}));

// Handle preflight
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test Route - Render pe yeh dikhega
app.get('/', (req, res) => {
    res.send('Backend is LIVE on Render! CORS enabled.');
});

// Send Email Route
app.post('/sendemail', async (req, res) => {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !message) {
        return res.status(400).json({ message: "Name, Email, Message required!" });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Portfolio" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        replyTo: email,
        subject: `Portfolio: ${subject || 'New Message'}`,
        html: `
            <h3>New Message from Portfolio</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr>
            <small>Sent from live portfolio.</small>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ message: "Failed to send.", error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});