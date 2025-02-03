/**
 * This module defines the routes for managing final grades in a Firestore database.
 * It includes the following functionalities:
 * 
 * 1. Add or update a grade:
 *    - Adds a new grade or updates an existing grade based on the provided projectCode and evaluationsByForm.
 * 
 * 2. Get a specific grade by ID:
 *    - Retrieves the details of a specific grade using its unique document ID.
 * 
 * 3. Get all grades:
 *    - Fetches all grade records from the Firestore database.
 * 
 * 4. Delete a grade:
 *    - Deletes a grade's record based on its unique document ID.
 * 
 * The module uses Firebase Admin SDK to interact with Firestore and includes input validation middleware.
 */
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


// Add or update grades for a project 
router.post("/", asyncHandler(async (req, res) => {
  const { projectCode, evaluationsByForm } = req.body;

  // Validate required fields
  if (!projectCode || !evaluationsByForm || evaluationsByForm.length === 0) {
    return res.status(400).json({
      error: {
        message: "Missing required fields: projectCode or evaluationsByForm.",
        status: 400,
      },
    });
  }

  console.log(`Received request to update grades for projectCode: ${projectCode}`);
  
  // Call the updated addOrUpdateGrade controller
  const result = await addOrUpdateGrade(req, res);
  return res.status(200).json(result);
}));

// Get a specific grade by ID
router.get("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: {
        message: "Grade ID is required.",
        status: 400,
      },
    });
  }

  console.log("Fetching grade with ID:", id);

  const result = await getGrade(req, res);
  return res.status(200).json(result);
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