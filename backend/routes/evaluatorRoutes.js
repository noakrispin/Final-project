const express = require("express");
const {
  addOrUpdateEvaluator,
  getEvaluator,
  getAllEvaluators,
  deleteEvaluator,
  getProjectsByEvaluator,
  getEvaluatorProjects,
  getEvaluatorsByProject,
} = require("../controllers/evaluatorController");

const router = express.Router();

// Add or update an evaluator
router.post("/", addOrUpdateEvaluator);

// Get a specific evaluator
router.get("/:id", getEvaluator);

// Get all evaluators
router.get("/", getAllEvaluators);

// Delete an evaluator
router.delete("/:id", deleteEvaluator);

// Get all projects assigned to a particular evaluator
router.get("/projects/:evaluatorID", getProjectsByEvaluator);

// Get all evaluators assigned to a specific project
router.get("/projectEvaluators/:projectCode", getEvaluatorsByProject);

// Fetch all projects supervised by a specific evaluator
router.get("/:id/projects", getEvaluatorProjects);

module.exports = router;
