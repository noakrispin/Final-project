const express = require("express");
const {
  addProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
  setGlobalDeadlineAndNotify, // Import the new function
  scheduleRemindersForAll, // New function for all supervisors
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

// Set global deadline and notify supervisors
router.post("/global-deadline", setGlobalDeadlineAndNotify);

// Route for scheduling reminders for all supervisors
router.post("/schedule-reminders-to-all", scheduleRemindersForAll);

module.exports = router;
