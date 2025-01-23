const express = require("express");
const {
  addOrUpdateGrade,
  getGrade,
  getAllGrades,
  deleteGrade,
} = require("../controllers/finalGradeController");

const router = express.Router();

// Async handler wrapper for consistent error handling
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Input validation middleware
const validateGradeInput = (req, res, next) => {
  const { grade, studentId, projectId } = req.body;
  
  if (typeof grade !== 'number' || grade < 0 || grade > 100) {
    return res.status(400).json({
      error: {
        message: 'Invalid grade value. Grade must be a number between 0 and 100',
        status: 400
      }
    });
  }

  if (!studentId || !projectId) {
    return res.status(400).json({
      error: {
        message: 'Student ID and Project ID are required',
        status: 400
      }
    });
  }

  next();
};

// Add or update a grade
router.post("/", validateGradeInput, asyncHandler(async (req, res) => {
  const result = await addOrUpdateGrade(req, res);
  return result;
}));

// Get a specific grade
router.get("/:id", asyncHandler(async (req, res) => {
  const result = await getGrade(req, res);
  return result;
}));

// Get all grades
router.get("/", asyncHandler(async (req, res) => {
  const result = await getAllGrades(req, res);
  return result;
}));

// Delete a grade
router.delete("/:id", asyncHandler(async (req, res) => {
  const result = await deleteGrade(req, res);
  return result;
}));

// Error handling middleware specific to grade routes
router.use((err, req, res, next) => {
  console.error('Grade route error:', err);

  // Handle specific grade-related errors
  if (err.code === 'grades/not-found') {
    return res.status(404).json({
      error: {
        message: 'Grade not found',
        status: 404
      }
    });
  }

  if (err.code === 'grades/permission-denied') {
    return res.status(403).json({
      error: {
        message: 'Permission denied to access grade information',
        status: 403
      }
    });
  }

  // Firebase specific errors
  if (err.code === 'permission-denied') {
    return res.status(403).json({
      error: {
        message: 'Insufficient permissions to perform this action',
        status: 403
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