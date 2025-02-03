/**
 * This module defines the routes for managing forms and their subcollections in a Firestore database.
 * It includes the following functionalities:
 * 
 * 1. Create a new form:
 *    - Creates a new form with subcollections.
 * 
 * 2. Update a specific form:
 *    - Updates the metadata and questions of a specific form.
 * 
 * 3. Fetch a specific form:
 *    - Retrieves the details of a specific form using its unique document ID.
 * 
 * 4. Get all forms:
 *    - Fetches all form records from the Firestore database.
 * 
 * 5. Delete a form:
 *    - Deletes a form along with its subcollections.
 * 
 * 6. Fetch questions for a specific form:
 *    - Retrieves all questions for a specific form.
 * 
 * 7. Add a new question to a form:
 *    - Adds a new question to a specific form.
 * 
 * 8. Update a specific question in a form:
 *    - Updates the details of a specific question in a form.
 * 
 * 9. Delete a specific question from a form:
 *    - Deletes a specific question from a form.
 * 
 * 10. Submit form data:
 *    - Submits form data including general and student-specific responses, and calculates weighted grades.
 * 
 * 11. Fetch the last response for a specific form, evaluator, and project:
 *    - Retrieves the last response for a specific form, evaluator, and project.
 * 
 * 12. Fetch all responses for a specific form:
 *    - Retrieves all responses for a specific form.
 * 
 * 13. Fetch form evaluations:
 *    - Retrieves all evaluations for a specific form.
 * 
 * 14. Fetch all evaluations for a specific evaluator:
 *    - Retrieves all evaluations for a specific evaluator.
 * 
 * 15. Fetch evaluations by evaluatorID and projectCode:
 *    - Retrieves evaluations for a specific evaluator and project.
 * 
 * The module uses Firebase Admin SDK to interact with Firestore and includes input validation middleware.
 */
const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");

// Async handler wrapper for consistent error handling
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Form Routes
router.get("/:formID", asyncHandler(async (req, res) => {
  const result = await formController.getForm(req, res);
  return result;
}));

router.get("/", asyncHandler(async (req, res) => {
  const result = await formController.getAllForms(req, res);
  return result;
}));

router.put("/:formID", asyncHandler(async (req, res) => {
  const result = await formController.updateForm(req, res);
  return result;
}));

// Question Routes
router.get("/:formID/questions", asyncHandler(async (req, res) => {
  const result = await formController.getQuestions(req, res);
  return result;
}));

router.put("/:formID/questions/:questionId", asyncHandler(async (req, res) => {
  const result = await formController.updateQuestion(req, res);
  return result;
}));

router.post("/:formID/questions", asyncHandler(async (req, res) => {
  console.log("Received request to add question:", req.body);
  const result = await formController.addQuestion(req, res);
  console.log("Response sent for add question:", result);
  return result;
}));

router.delete("/:formID/questions/:questionId", asyncHandler(async (req, res) => {
  const result = await formController.deleteQuestion(req, res);
  return result;
}));

// Submission Routes
router.post("/:formID/submit", asyncHandler(async (req, res) => {
  const result = await formController.submitForm(req, res);
  return result;
}));

// Evaluation Routes
router.get("/:formID/evaluations", asyncHandler(async (req, res) => {
  const result = await formController.getEvaluations(req, res);
  return result;
}));

router.get("/evaluations/all", asyncHandler(async (req, res) => {
  const result = await formController.getEvaluationsByEvaluator(req, res);
  return result;
}));

// Fetch evaluations by evaluatorID and projectCode
router.get(
  "/evaluations/by-evaluator-project",
  asyncHandler(async (req, res) => {
    const result = await formController.getEvaluationByEvaluatorAndProject(req, res);
    return result;
  })
);

// Response Routes
router.get("/:formID/responses", asyncHandler(async (req, res) => {
  const result = await formController.getResponses(req, res);
  return result;
}));

router.get("/:formID/last-response", asyncHandler(async (req, res) => {
  const result = await formController.getLastResponse(req, res);
  return result;
}));

// Form Management Routes
router.post("/", asyncHandler(async (req, res) => {
  const result = await formController.createForm(req, res);
  return result;
}));

router.delete("/:formID", asyncHandler(async (req, res) => {
  const result = await formController.deleteForm(req, res);
  return result;
}));

// Error handling middleware specific to form routes
router.use((err, req, res, next) => {
  console.error('Form route error:', err);

  // Handle specific form-related errors
  if (err.code === 'form/not-found') {
    return res.status(404).json({
      error: {
        message: 'Form not found',
        status: 404
      }
    });
  }

  if (err.code === 'form/invalid-submission') {
    return res.status(400).json({
      error: {
        message: 'Invalid form submission',
        status: 400
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