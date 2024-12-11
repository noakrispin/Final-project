const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection
const app = express();
const port = 3001;
// Import route files
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

app.use(cors());
app.use(express.json());

// Register routes with prefixes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
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
