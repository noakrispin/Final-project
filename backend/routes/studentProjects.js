// Router for `student_projects`
////////////////////////////////verify logic of pairs////////////////////////////////////////

const express = require('express');
const db = require('../db'); // Import database connection
const router = express.Router();

// Fetch all student-project mappings
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM student_projects');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching student-project mappings:', error);
    res.status(500).json({ error: 'Failed to fetch student-project mappings' });
  }
});

// Fetch students assigned to a specific project
router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    // Query to fetch student names and partner names associated with the project
    const [rows] = await db.query(
      `
      SELECT u1.id AS student_id, u1.username AS student_name, u2.id AS partner_id, u2.username AS partner_name
      FROM student_projects sp
      LEFT JOIN users u1 ON sp.student_id = u1.id
      LEFT JOIN users u2 ON sp.partner_id = u2.id
      WHERE sp.project_id = ?;
      `,
      [projectId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching students for project:', error);
    res.status(500).json({ error: 'Failed to fetch students for project' });
  }
});

// Assign a student (and optionally a partner) to a project
router.post('/', async (req, res) => {
  const { project_id, student_id, partner_id } = req.body;

  try {
    // Insert a single row for the student and their partner
    await db.query(
      'INSERT INTO student_projects (project_id, student_id, partner_id) VALUES (?, ?, ?)',
      [project_id, student_id, partner_id || null]
    );
    res.status(201).json({ message: 'Student(s) assigned to project successfully' });
  } catch (error) {
    console.error('Error assigning student(s) to project:', error);
    res.status(500).json({ error: 'Failed to assign student(s) to project' });
  }
});

// Remove a student (and their partner) from a project
router.delete('/project/:projectId/student/:studentId', async (req, res) => {
  const { projectId, studentId } = req.params;

  try {
    // Delete the row where either the student_id or partner_id matches
    await db.query(
      'DELETE FROM student_projects WHERE project_id = ? AND (student_id = ? OR partner_id = ?)',
      [projectId, studentId, studentId]
    );
    res.status(200).json({ message: 'Student (and partner, if any) removed from project successfully' });
  } catch (error) {
    console.error('Error removing student from project:', error);
    res.status(500).json({ error: 'Failed to remove student from project' });
  }
});

module.exports = router;
