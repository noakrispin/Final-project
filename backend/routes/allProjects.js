// Router for `all_projects`
const express = require('express');
const db = require('../db'); // Import database connection
const router = express.Router();

// Fetch all projects
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM all_projects');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Fetch projects by lecturer ID
router.get('/lecturer/:lecturerId', async (req, res) => {
  const { lecturerId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT ap.*, 
        GROUP_CONCAT(DISTINCT CONCAT(u.username, IFNULL(CONCAT(' & ', p.username), '')) SEPARATOR ', ') AS students,
        SUM(CASE WHEN sp.is_registered = TRUE THEN 1 ELSE 0 END) AS registered_count
      FROM all_projects ap
      LEFT JOIN student_projects sp ON ap.id = sp.project_id
      LEFT JOIN users u ON sp.student_id = u.id
      LEFT JOIN users p ON sp.partner_id = p.id
      JOIN lecturer_projects lp ON lp.project_id = ap.id
      WHERE lp.lecturer_id = ? OR lp.lecturer2_id = ?
      GROUP BY ap.id;
      `,
      [lecturerId, lecturerId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects for lecturer:', error);
    res.status(500).json({ error: 'Failed to fetch projects for lecturer' });
  }
});

// Change project status (approve or reject)
router.patch('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { action } = req.body;

  try {
    if (action === 'approve') {
      const [project] = await db.query('SELECT * FROM all_projects WHERE id = ?', [projectId]);

      if (!project.length) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const projectData = project[0];

      // Update the project status to "Approved"
      await db.query('UPDATE all_projects SET status = ? WHERE id = ?', ['Approved', projectId]);

      // Insert the approved project into `approved_projects`
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
          new Date().getFullYear(),
          'On Track',
          'Not Submitted',
          'Not Submitted',
          null,
          null,
        ]
      );

      // Mark students as registered for the project
      await db.query('UPDATE student_projects SET is_registered = TRUE WHERE project_id = ?', [projectId]);

      res.status(200).json({ message: 'Project approved, added to approved_projects, and student registrations updated.' });
    } else if (action === 'reject') {
      // Reset project status to "Unassigned"
      await db.query('UPDATE all_projects SET status = ? WHERE id = ?', ['Unassigned', projectId]);

      // Unlink students by setting `project_id` to NULL and resetting `is_registered`
      await db.query('UPDATE student_projects SET project_id = NULL, is_registered = FALSE WHERE project_id = ?', [
        projectId,
      ]);

      res.status(200).json({ message: 'Project rejected, students unlinked, and registrations reset successfully.' });
    } else {
      res.status(400).json({ error: 'Invalid action.' });
    }
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project status.' });
  }
});

module.exports = router;
