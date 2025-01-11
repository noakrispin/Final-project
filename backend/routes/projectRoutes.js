const express = require("express");
const {
  addProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
} = require("../utils/firebaseHelper");

const router = express.Router();

// Add a new project
router.post("/", async (req, res) => {
  const { projectCode, data } = req.body;
  const response = await addProject(projectCode, data);
  res.json(response);
});

// Get details of a specific project
router.get("/:projectCode", async (req, res) => {
  const response = await getProject(req.params.projectCode);
  res.json(response);
});

// Get all projects
router.get("/", async (req, res) => {
  const response = await getAllProjects();
  res.json(response);
});

// Update a project
router.put("/:projectCode", async (req, res) => {
  const response = await updateProject(req.params.projectCode, req.body);
  res.json(response);
});

// Delete a project
router.delete("/:projectCode", async (req, res) => {
  const response = await deleteProject(req.params.projectCode);
  res.json(response);
});

module.exports = router;
