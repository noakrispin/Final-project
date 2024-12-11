const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Add a new project
router.post('/', async (req, res) => {
  const { title, description, student_id, lecturer_id, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO projects (title, description, student_id, lecturer_id, status) VALUES (?, ?, ?, ?, ?)',
      [title, description, student_id, lecturer_id, status]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

module.exports = router;
