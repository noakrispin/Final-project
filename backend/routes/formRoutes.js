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
  const result = await formController.addQuestion(req, res);
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