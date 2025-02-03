/**
 * This module defines the routes for managing projects in a Firestore database.
 * It includes the following functionalities:
 * 
 * 1. Add a new project:
 *    - Adds a new project to the Firestore database.
 * 
 * 2. Get details of a specific project:
 *    - Retrieves the details of a specific project using its unique project code.
 * 
 * 3. Get all projects:
 *    - Fetches all project records from the Firestore database.
 * 
 * 4. Update a project:
 *    - Updates the details of a specific project based on its project code.
 * 
 * 5. Delete a project:
 *    - Deletes a project based on its unique project code.
 * 
 * 6. Set a global deadline and notify supervisors:
 *    - Sets a global deadline for all projects and sends notification emails to supervisors.
 * 
 * The module uses Firebase Admin SDK to interact with Firestore and includes input validation middleware.
 */
const express = require("express");
const {
  addProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
  setGlobalDeadlineAndNotify,
} = require("../controllers/projectController");

const router = express.Router();

// Wrap each route handler in try-catch for better error handling in serverless
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Add a new project
router.post("/", asyncHandler(async (req, res) => {
  const result = await addProject(req, res);
  return result;
}));

// Get details of a specific project
router.get("/:projectCode", asyncHandler(async (req, res) => {
  const result = await getProject(req, res);
  return result;
}));

// Get all projects
router.get("/", asyncHandler(async (req, res) => {
  const result = await getAllProjects(req, res);
  return result;
}));

// Update a project
router.put("/:projectCode", asyncHandler(async (req, res) => {
  const result = await updateProject(req, res);
  return result;
}));

// Delete a project
router.delete("/:projectCode", asyncHandler(async (req, res) => {
  const result = await deleteProject(req, res);
  return result;
}));

// Set global deadline and notify supervisors
router.post("/global-deadline", asyncHandler(async (req, res) => {
  const result = await setGlobalDeadlineAndNotify(req, res);
  return result;
}));

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

module.exports = router;