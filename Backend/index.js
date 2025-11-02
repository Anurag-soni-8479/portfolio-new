const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS — Allow GitHub Pages + Localhost (5500, 5501)
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5500',
    'http://localhost:5501',
    'https://anurag-soni-8479.github.io',
    'https://anurag-soni-8479.github.io/portfolio-new'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
    res.send('Backend LIVE on Render! CORS: GitHub Pages + Localhost allowed.');
});

// Send Email Route (Fixed for Render)
app.post('/sendemail', async (req, res) => {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !message) {
        return res.status(400).json({ message: "Fill Name, Email, Message!" });
    }

    // Fixed Transporter for Render (TLS + Timeout)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,  // TLS
        tls: {
            rejectUnauthorized: false  // Ignore cert issues (Render common)
        },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 30000,  // 30 sec timeout
        greetingTimeout: 10000,
        socketTimeout: 30000
    });

    const mailOptions = {
        from: `"Portfolio" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        replyTo: email,
        subject: `New Message: ${subject || 'Contact Form'}`,
        html: `
            <h3>New Contact</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong> ${message}</p>
        `
    };

    try {
        // Verify transporter (optional, for debug)
        await transporter.verify();
        console.log('SMTP ready');

        await transporter.sendMail(mailOptions);
        res.json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("Email Error:", error.code, error.message);
        res.status(500).json({ message: "Failed to send. Try again later." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});