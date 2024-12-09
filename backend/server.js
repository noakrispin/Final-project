const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

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
