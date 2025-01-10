const express = require("express");
const { login, register, resetPassword, verifyUser } = require("../controllers/authController");

const router = express.Router();

// Route for user login
router.post("/login", login);

// Route for user registration
router.post("/register", register);


router.post('/verify-user', verifyUser);

// Route for resetting password
router.post("/reset-password", resetPassword);

module.exports = router;
