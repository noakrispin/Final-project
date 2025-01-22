const express = require("express");
const { 
  addUser, 
  getUser, 
  getAllUsers, 
  deleteUser, 
  updateUserRole 
} = require("../controllers/userController");
const db = require("../config/firebaseAdmin");

const router = express.Router();

// Middleware to check Firebase connection
const checkFirebase = (req, res, next) => {
  if (!db) {
    console.error('Firebase database not initialized');
    return res.status(500).json({
      success: false,
      message: "Database connection error",
      error: "Firebase not initialized"
    });
  }
  next();
};

// Apply Firebase check middleware to all routes
router.use(checkFirebase);

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all users with better error handling
router.get("/", asyncHandler(async (req, res) => {
  try {
    const result = await getAllUsers(req, res);
    return result;
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

// Other routes with similar error handling...

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('User route error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = router;