const express = require('express');
const db = require('../db');
const router = express.Router();

// Check if ID exists
router.get('/check', async (req, res) => {
    const { id } = req.query; // Extract 'id' from query parameters
    try {
      const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (user.length > 0) {
        return res.json({ exists: true });
      }
      res.json({ exists: false });
    } catch (error) {
      console.error('Error checking user existence:', error);
      res.status(500).json({ error: 'Error checking user existence' });
    }
  });


// Sign Up Route
router.post('/signup', async (req, res) => {
  const { id, fullName, email, password, role } = req.body;
  try {
    // Check if the ID already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User with the same ID already exists' });
    }

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, fullName, email, password, role]
    );

    res.status(201).json({ message: 'User created successfully', user: { id, fullName, email, role } });
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


module.exports = router;
