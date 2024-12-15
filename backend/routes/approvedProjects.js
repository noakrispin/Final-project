// Router for `approved_projects`
const express = require('express');
const db = require('../db'); // Import database connection
const router = express.Router();

// Fetch all approved projects
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM approved_projects');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching approved projects:', error);
    res.status(500).json({ error: 'Failed to fetch approved projects' });
  }
});

// Fetch approved projects for a specific lecturer or co-lecturer
router.get('/lecturer/:lecturerId', async (req, res) => {
  const { lecturerId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT ap.*
      FROM approved_projects ap
      JOIN lecturer_projects lp ON ap.id = lp.project_id
      WHERE lp.lecturer_id = ? OR lp.lecturer2_id = ?
      `,
      [lecturerId, lecturerId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching approved projects for lecturer:', error);
    res.status(500).json({ error: 'Failed to fetch approved projects for lecturer' });
  }
});


// Fetch approved projects by year
router.get('/year/:year', async (req, res) => {
  const { year } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM approved_projects WHERE year = ?', [year]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching approved projects for year:', error);
    res.status(500).json({ error: 'Failed to fetch approved projects for year' });
  }
});

// Fetch approved projects by part (A or B)
router.get('/part/:part', async (req, res) => {
    const { part } = req.params;
    try {
      const [rows] = await db.query('SELECT * FROM approved_projects WHERE part = ?', [part]);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching approved projects by part:', error);
      res.status(500).json({ error: 'Failed to fetch approved projects by part' });
    }
  });
  

// Update details for an approved project
router.patch('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { deadline, git_link, status } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE approved_projects SET deadline = ?, git_link = ?, status = ? WHERE id = ?',
      [deadline, git_link, status, projectId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found or no changes were made' });
    }

    res.status(200).json({ message: 'Details updated successfully' });
  } catch (error) {
    console.error('Error updating approved project details:', error);
    res.status(500).json({ error: 'Failed to update approved project details' });
  }
});

// Archive an approved project (alternative to deletion)
router.patch('/archive/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE approved_projects SET status = "Archived" WHERE id = ?',
      [projectId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found or already archived' });
    }

    res.status(200).json({ message: 'Project archived successfully' });
  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(500).json({ error: 'Failed to archive project' });
  }
});

module.exports = router;
