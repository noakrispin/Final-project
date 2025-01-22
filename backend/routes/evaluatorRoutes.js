const express = require("express");
const {
  addOrUpdateEvaluator,
  getEvaluator,
  getAllEvaluators,
  deleteEvaluator,
  getProjectsByEvaluator,
  getProjectsForEvaluatorByForm,
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


router.get('/:evaluatorID/projects/:formID', getProjectsForEvaluatorByForm);




module.exports = router;
