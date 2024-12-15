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
      SELECT u1.id AS student_id, u1.username AS student_name, 
             u2.id AS partner_id, u2.username AS partner_name,
             sp.is_registered
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
    // Check project status
    const [project] = await db.query('SELECT status FROM all_projects WHERE id = ?', [project_id]);
    if (!project.length) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isRegistered = project[0].status === 'Approved';

    // Insert a single row for the student and their partner
    await db.query(
      'INSERT INTO student_projects (project_id, student_id, partner_id, is_registered) VALUES (?, ?, ?, ?)',
      [project_id, student_id, partner_id || null, isRegistered]
    );

    res.status(201).json({ message: 'Student(s) assigned to project successfully' });
  } catch (error) {
    console.error('Error assigning student(s) to project:', error);
    res.status(500).json({ error: 'Failed to assign student(s) to project' });
  }
});

// Update `is_registered` to FALSE for a student and their partner
router.patch('/project/:projectId/student/:studentId', async (req, res) => {
  const { projectId, studentId } = req.params;

  try {
    // Update `is_registered` to FALSE for the student and their partner
    await db.query(
      'UPDATE student_projects SET is_registered = FALSE WHERE project_id = ? AND (student_id = ? OR partner_id = ?)',
      [projectId, studentId, studentId]
    );

    res.status(200).json({ message: 'Student (and partner, if any) unregistered from project successfully' });
  } catch (error) {
    console.error('Error unregistering student from project:', error);
    res.status(500).json({ error: 'Failed to unregister student from project' });
  }
});

// Update the `is_registered` status for students when the project is approved
router.patch('/update-registration/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { is_registered } = req.body;

  try {
    // Update the registration status for all students and partners linked to the project
    await db.query(
      'UPDATE student_projects SET is_registered = ? WHERE project_id = ?',
      [is_registered, projectId]
    );

    res.status(200).json({ message: 'Registration status updated successfully' });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ error: 'Failed to update registration status' });
  }
});

module.exports = router;
