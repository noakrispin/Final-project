const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: '192.168.1.82', 
  user: 'root', 
  password: '12345678', 
  database: 'projecthub', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the promise-based connection pool
const promisePool = pool.promise();

module.exports = promisePool;
