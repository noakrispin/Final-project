// Router for `lecturer_projects`
const express = require('express');
const db = require('../db'); // Import database connection
const router = express.Router();

// Fetch all lecturer-project mappings
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lecturer_projects');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching lecturer-project mappings:', error);
    res.status(500).json({ error: 'Failed to fetch lecturer-project mappings' });
  }
});

// Fetch projects supervised by a specific lecturer
router.get('/lecturer/:lecturerId', async (req, res) => {
  const { lecturerId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT ap.* 
       FROM lecturer_projects lp 
       JOIN all_projects ap ON lp.project_id = ap.id 
       WHERE lp.lecturer_id = ? OR lp.lecturer2_id = ?`,
      [lecturerId, lecturerId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects for lecturer:', error);
    res.status(500).json({ error: 'Failed to fetch projects for lecturer' });
  }
});

// Assign a project to a lecturer
router.post('/', async (req, res) => {
  const { project_id, lecturer_id, lecturer2_id } = req.body;

  try {
    await db.query(
      'INSERT INTO lecturer_projects (project_id, lecturer_id, lecturer2_id) VALUES (?, ?, ?)',
      [project_id, lecturer_id, lecturer2_id || null]
    );
    res.status(201).json({ message: 'Project assigned to lecturer(s) successfully' });
  } catch (error) {
    console.error('Error assigning project to lecturer:', error);
    res.status(500).json({ error: 'Failed to assign project to lecturer' });
  }
});

// Remove a lecturer-project mapping
router.delete('/:mappingId', async (req, res) => {
  const { mappingId } = req.params;

  try {
    await db.query('DELETE FROM lecturer_projects WHERE id = ?', [mappingId]);
    res.status(200).json({ message: 'Lecturer-project mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecturer-project mapping:', error);
    res.status(500).json({ error: 'Failed to delete lecturer-project mapping' });
  }
});

module.exports = router;
