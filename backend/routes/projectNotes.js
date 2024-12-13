// Router for `project_notes`
const express = require('express');
const db = require('../db'); // Import database connection
const router = express.Router();

// Fetch all notes for all projects
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM project_notes');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching project notes:', error);
    res.status(500).json({ error: 'Failed to fetch project notes' });
  }
});

// Fetch notes for a specific project
router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM project_notes WHERE project_id = ?',
      [projectId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notes for project:', error);
    res.status(500).json({ error: 'Failed to fetch notes for project' });
  }
});

// Fetch notes added by a specific lecturer
router.get('/lecturer/:lecturerId', async (req, res) => {
  const { lecturerId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM project_notes WHERE lecturer_id = ?',
      [lecturerId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notes for lecturer:', error);
    res.status(500).json({ error: 'Failed to fetch notes for lecturer' });
  }
});

// Add a new note for a project
router.post('/', async (req, res) => {
  const { project_id, lecturer_id, note } = req.body;

  try {
    await db.query(
      'INSERT INTO project_notes (project_id, lecturer_id, note) VALUES (?, ?, ?)',
      [project_id, lecturer_id, note]
    );
    res.status(201).json({ message: 'Note added successfully' });
  } catch (error) {
    console.error('Error adding note to project:', error);
    res.status(500).json({ error: 'Failed to add note to project' });
  }
});

// Update a specific note
router.patch('/:noteId', async (req, res) => {
  const { noteId } = req.params;
  const { note } = req.body;

  try {
    await db.query(
      'UPDATE project_notes SET note = ? WHERE id = ?',
      [note, noteId]
    );
    res.status(200).json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a specific note
router.delete('/:noteId', async (req, res) => {
  const { noteId } = req.params;

  try {
    await db.query('DELETE FROM project_notes WHERE id = ?', [noteId]);
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
