/**
 * This module provides a service for sending emails using Nodemailer.
 * It includes the following functionalities:
 * 
 * 1. Configure the email transport:
 *    - Sets up the email transport using Gmail and environment variables for authentication.
 * 
 * 2. Send an email:
 *    - Sends an email to the specified recipient(s) with the given subject and text.
 * 
 * The module uses Nodemailer for email transport and dotenv for loading environment variables.
 */
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
