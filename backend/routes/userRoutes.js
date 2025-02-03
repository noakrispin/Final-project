/**
 * This module defines the routes for managing users in a Firestore database.
 * It includes the following functionalities:
 * 
 * 1. Add a new user:
 *    - Adds a new user to the Firestore database.
 * 
 * 2. Get details of a specific user:
 *    - Retrieves the details of a specific user using their unique document ID.
 * 
 * 3. Get all users:
 *    - Fetches all user records from the Firestore database.
 * 
 * 4. Delete a user:
 *    - Deletes a user based on their unique document ID.
 * 
 * 5. Update user role:
 *    - Updates the role of a specific user based on their unique document ID.
 * 
 * The module uses Firebase Admin SDK to interact with Firestore and includes middleware for checking Firebase connection and handling errors.
 */
const express = require("express");
const { addUser, getUser, getAllUsers, deleteUser, updateUserRole } = require("../controllers/userController");
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

// Define routes
router.post("/", asyncHandler(addUser));  // Add user
router.get("/:id", asyncHandler(getUser));  // Get single user by ID
router.get("/", asyncHandler(getAllUsers));  // Get all users
router.delete("/:id", asyncHandler(deleteUser));  // Delete user by ID
router.put("/:userId/role", asyncHandler(updateUserRole));  // Update user role

// Error handling middleware for route errors
router.use((err, req, res, next) => {
  console.error('User route error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = router;
