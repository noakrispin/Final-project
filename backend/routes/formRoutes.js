const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");

// Fetch a specific form
router.get("/:formID", formController.getForm);

// Update a specific form
router.put("/:formID", formController.updateForm);

// Fetch questions for a specific form
router.get("/:formID/questions", formController.getQuestions);

// Submit form data (for general and student-specific responses)
router.post("/:formID/submit", formController.submitForm);

// Update a specific question in a form
router.put("/:formID/questions/:questionId", formController.updateQuestion);

// Add a new question to a form
router.post("/:formID/questions", formController.addQuestion);

// Delete a specific question from a form
router.delete("/:formID/questions/:questionId", formController.deleteQuestion);


// Fetch form evaluations
router.get("/:formID/evaluations", formController.getEvaluations);

// Create a new form
router.post("/", formController.createForm);

// Delete a specific form along with its subcollections
router.delete("/:formID", formController.deleteForm);

// Fetch all evaluations for an evaluator
router.get("/evaluations/all", formController.getEvaluationsByEvaluator);

// Fetch the last response for an evaluator and optionally for a specific student
router.get("/:formID/last-response", formController.getLastResponse);



module.exports = router;
