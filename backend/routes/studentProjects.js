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

// Fetch projects a specific student is associated with
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT ap.* 
       FROM student_projects sp 
       JOIN all_projects ap ON sp.project_id = ap.id 
       WHERE sp.student_id = ? OR sp.partner_id = ?`,
      [studentId, studentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects for student:', error);
    res.status(500).json({ error: 'Failed to fetch projects for student' });
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

// Update partner for a student-project mapping
router.patch('/:mappingId', async (req, res) => {
  const { mappingId } = req.params;
  const { partner_id } = req.body;

  try {
    // Update the partner_id for the specific mapping
    await db.query('UPDATE student_projects SET partner_id = ? WHERE id = ?', [partner_id, mappingId]);
    res.status(200).json({ message: 'Partner updated successfully' });
  } catch (error) {
    console.error('Error updating partner for student-project mapping:', error);
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

module.exports = router;
