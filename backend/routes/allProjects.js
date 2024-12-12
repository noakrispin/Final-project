// Router for `all_projects`
const express = require('express');
const db = require('../db'); // Import database connection
const router = express.Router();

// Fetch all projects
router.get('/', async (req, res) => {
  try {
    // Query to fetch all rows from the `all_projects` table
    const [rows] = await db.query('SELECT * FROM all_projects');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Fetch projects by lecturer ID
router.get('/lecturer/:lecturerId', async (req, res) => {
  const { lecturerId } = req.params; // Extract lecturer ID from URL parameters
  try {
    // Query to fetch projects created by a specific lecturer
    const [rows] = await db.query(
      'SELECT * FROM all_projects WHERE created_by_lecturer_id = ?',
      [lecturerId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects for lecturer:', error);
    res.status(500).json({ error: 'Failed to fetch projects for lecturer' });
  }
});

// Change project status (approve or reject)
router.patch('/:projectId', async (req, res) => {
  const { projectId } = req.params; // Extract project ID from URL parameters
  const { action } = req.body; // Extract action from request body

  try {
    if (action === 'approve') {
      // Approve project and move it to `approved_projects`
      const [project] = await db.query('SELECT * FROM all_projects WHERE id = ?', [projectId]);

      if (!project.length) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const projectData = project[0];

      // Update the project status to "Approved" in `all_projects`
      await db.query('UPDATE all_projects SET status = ? WHERE id = ?', ['Approved', projectId]);

      // Insert the approved project into the `approved_projects` table
      await db.query(
        `INSERT INTO approved_projects (id, title, description, type, key_interests, outside_companies, 
         approved_by_lecturer_id, year, status, grade_status, feedback_status, deadline, git_link) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectData.id,
          projectData.title,
          projectData.description,
          projectData.type,
          projectData.key_interests,
          projectData.outside_companies,
          projectData.created_by_lecturer_id,
          new Date().getFullYear(), // Current year
          'On Track',
          'Not Submitted',
          'Not Submitted',
          null, // Deadline can be set later
          null, // Git link can be added later
        ]
      );

      res.status(200).json({ message: 'Project approved and added to approved_projects' });
    } else if (action === 'reject') {
      // Reject project and reset its status
      await db.query('UPDATE all_projects SET status = ? WHERE id = ?', ['Unassigned', projectId]);

      // Remove the project association from `student_projects`
      await db.query('DELETE FROM student_projects WHERE project_id = ?', [projectId]);

      res.status(200).json({ message: 'Project status reset to Unassigned and student associations removed' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

module.exports = router;
