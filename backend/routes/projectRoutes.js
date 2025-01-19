const express = require("express");
const {
  addProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// Add a new project
router.post("/", addProject);

// Get details of a specific project
router.get("/:projectCode", getProject);

// Get all projects
router.get("/", getAllProjects);

// Update a project
router.put("/:projectCode", updateProject);

// Delete a project
router.delete("/:projectCode", deleteProject);

module.exports = router;
