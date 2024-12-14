// backend/routes/users.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { ID, fullName, email, password, role } = req.body;
  try {
    // Check if the ID already exists
    const [existingID] = await db.query('SELECT * FROM users WHERE id = ?', [ID]);
    if (existingID.length > 0) {
      return res.status(400).json({ error: 'User with the same ID already exists' });
    }

    // Check if the email already exists
    const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'User with the same email already exists' });
    }

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [ID, fullName, email, password, role]
    );

    res.status(201).json({ message: 'User created successfully', user: { ID, fullName, email, role } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Check if user exists by username or email
    const [user] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    if (user.length === 0) {
      // User does not exist
      return res.status(404).json({ error: 'User does not exist. Please sign up.' });
    }

    // Check if password matches
    const [validUser] = await db.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?',
      [usernameOrEmail, usernameOrEmail, password]
    );

    if (validUser.length === 0) {
      // Password is incorrect
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // Successful login
    const loggedInUser = {
      id: validUser[0].id,
      username: validUser[0].username,
      email: validUser[0].email,
      role: validUser[0].role,
    };

    res.status(200).json({ message: 'Login successful', user: loggedInUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});


//Change Paswword
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user[0].password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password. Please try again.' });
  }
});


module.exports = router;
