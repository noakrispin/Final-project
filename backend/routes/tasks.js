const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add a new task
router.post('/', async (req, res) => {
  const { task_title, task_description, task_due_date, lecturer_id, project_id, task_status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO tasks (task_title, task_description, task_due_date, lecturer_id, project_id, task_status) VALUES (?, ?, ?, ?, ?, ?)',
      [task_title, task_description, task_due_date, lecturer_id, project_id, task_status]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

module.exports = router;
