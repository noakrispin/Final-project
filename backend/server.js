const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection
const app = express();
const port = 3001;

// Import route files
const userRoutes = require('./routes/users');
const allProjectsRoutes = require('./routes/allProjects');
const approvedProjectsRoutes = require('./routes/approvedProjects');
const lecturerProjectsRoutes = require('./routes/lecturerProjects');
const studentProjectsRoutes = require('./routes/studentProjects');
const projectNotesRoutes = require('./routes/projectNotes');
const taskRoutes = require('./routes/tasks');

// Middleware
app.use(cors());
app.use(express.json());

// Register routes with correct prefixes
app.use('/api/users', userRoutes);
app.use('/api/all_projects', allProjectsRoutes);
app.use('/api/approved_projects', approvedProjectsRoutes);
app.use('/api/lecturer_projects', lecturerProjectsRoutes);
app.use('/api/student_projects', studentProjectsRoutes);
app.use('/api/project_notes', projectNotesRoutes);
app.use('/api/tasks', taskRoutes);

// Function to start the server after confirming the database connected successfully
const startServer = async () => {
  try {
    await db.query('SELECT 1'); // Simple query to test the connection
    console.log('\nDatabase connected successfully!\n');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit if the database connection fails
  }
};

// Start the server
startServer();
