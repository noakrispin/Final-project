const express = require("express");
const { 
  addUser, 
  getUser, 
  getAllUsers, 
  deleteUser, 
  updateUserRole 
} = require("../controllers/userController");

const router = express.Router();

// Async handler wrapper for consistent error handling
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Add a new user
router.post("/", asyncHandler(async (req, res) => {
  const result = await addUser(req, res);
  return result;
}));

// Fetch user details along with subcollections
router.get("/:id", asyncHandler(async (req, res) => {
  const result = await getUser(req, res);
  return result;
}));

// Fetch all users
router.get("/", asyncHandler(async (req, res) => {
  const result = await getAllUsers(req, res);
  return result;
}));

// Delete user
router.delete("/:id", asyncHandler(async (req, res) => {
  const result = await deleteUser(req, res);
  return result;
}));

// Update user role
router.put("/:userId/role", asyncHandler(async (req, res) => {
  const result = await updateUserRole(req, res);
  return result;
}));

// Error handling middleware specific to user routes
router.use((err, req, res, next) => {
  console.error('User route error:', err);
  
  // Handle specific Firebase errors
  if (err.code === 'auth/user-not-found') {
    return res.status(404).json({
      error: {
        message: 'User not found',
        status: 404
      }
    });
  }
  
  if (err.code === 'auth/invalid-uid') {
    return res.status(400).json({
      error: {
        message: 'Invalid user ID',
        status: 400
      }
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message,
      status: err.status || 500
    }
  });
});

module.exports = router;