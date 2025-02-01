const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure the email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS, // App password created in Gmail
  },
});

// Function to send an email
const sendEmail = async (to, subject, text) => {
  console.log(`Attempting to send email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to,                           // List of recipients
      subject,                      // Subject line
      text,                         // Plain text body
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };
