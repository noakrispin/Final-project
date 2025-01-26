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
// const validateGradeInput = (req, res, next) => {
//   const { grade, studentId, projectCode } = req.body;

//   // Validate grade: must be null, undefined, or a number between 0 and 100
//   if (
//     grade !== undefined &&
//     grade !== null &&
//     (typeof grade !== "number" || grade < 0 || grade > 100)
//   ) {
//     return res.status(400).json({
//       error: {
//         message: "Invalid grade value. Grade must be a number between 0 and 100 or null.",
//         status: 400,
//       },
//     });
//   }

//   // Validate studentId and projectCode: must be present
//   if (!studentId || !projectCode) {
//     return res.status(400).json({
//       error: {
//         message: "Student ID and Project Code are required.",
//         status: 400,
//       },
//     });
//   }

//   next(); // Continue to the next middleware or route handler
// };


// Add or update grades for a project (using projectCode)
router.post("/:projectCode", asyncHandler(async (req, res) => {
  const { projectCode } = req.params; // Use `projectCode` from the route
  const { evaluatorID, formID, grades } = req.body;

  // Validate required data
  if (!projectCode || !evaluatorID || !formID || !grades) {
    return res.status(400).json({
      error: {
        message: "Missing required fields: projectCode, evaluatorID, formID, or grades.",
        status: 400,
      },
    });
  }

  console.log("Processing grades for projectCode:", projectCode);

  // Call the controller
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
////

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