const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const db = require("../config/firebaseAdmin");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usersSnapshot = await db.collection("users").where("email", "==", email).get();
    if (usersSnapshot.empty) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const role = userData.role;

    res.json({
      success: true,
      message: "Login successful",
      user: { id: userData.id, fullName: userData.fullName, email: userData.email, role },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, error: "An error occurred while processing the login request." });
  }
};

const register = async (req, res) => {
  const { id, fullName, email, role, password } = req.body;
  try {
    if (!id || id.length !== 9 || !/^\d{9}$/.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    if (!email || !/^[a-zA-Z0-9._%+-]+@e\.braude\.ac\.il$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const usersSnapshot = await db.collection("users").where("email", "==", email).get();
    if (!usersSnapshot.empty) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const idDoc = await db.collection("users").doc(id).get();
    if (idDoc.exists) {
      return res.status(400).json({ success: false, message: "ID already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").doc(id).set({
      id,
      fullName,
      email,
      role,
      password: hashedPassword,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Registration Successful",
      html: `
        <h1>Welcome to the Final Project Portal, ${fullName}!</h1>
        <p>Your registration was successful.</p>
        <p><strong>ID:</strong> ${id}</p>
        <p>Feel free to log in and start exploring.</p>
        <p>Best regards,<br>The Team</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully to " + email);
    } catch (error) {
      console.error("Error sending email:", error.message);
    }

    res.json({ success: true, message: "User registered successfully", id });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "An error occurred while processing the registration request." });
  }
};

module.exports = { login, register };
