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

// Async handler wrapper for consistent error handling
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Input validation middleware
const validateEvaluatorInput = (req, res, next) => {
  const { name, evaluatorID , department } = req.body;
  
  if (!evaluatorID  || !evaluatorID .includes('@')) {
    return res.status(400).json({
      error: {
        message: 'Valid email is required',
        status: 400
      }
    });
  }

  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      error: {
        message: 'Evaluator name is required',
        status: 400
      }
    });
  }

  next();
};

// Parameter validation middleware
const validateParams = (paramName) => {
  return (req, res, next) => {
    const param = req.params[paramName];
    if (!param || param.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: `Invalid ${paramName} parameter`,
          status: 400
        }
      });
    }
    next();
  };
};

// Add or update an evaluator
router.post("/", 
  validateEvaluatorInput,
  asyncHandler(async (req, res) => {
    const result = await addOrUpdateEvaluator(req, res);
    return result;
  })
);

// Get a specific evaluator
router.get("/:id",
  validateParams('id'),
  asyncHandler(async (req, res) => {
    const result = await getEvaluator(req, res);
    return result;
  })
);

// Get all evaluators
router.get("/",
  asyncHandler(async (req, res) => {
    const result = await getAllEvaluators(req, res);
    return result;
  })
);

// Delete an evaluator
router.delete("/:id",
  validateParams('id'),
  asyncHandler(async (req, res) => {
    const result = await deleteEvaluator(req, res);
    return result;
  })
);

// Get all projects assigned to a particular evaluator
router.get("/projects/:evaluatorID",
  validateParams('evaluatorID'),
  asyncHandler(async (req, res) => {
    const result = await getProjectsByEvaluator(req, res);
    return result;
  })
);

// Get all evaluators assigned to a specific project
router.get("/projectEvaluators/:projectCode",
  validateParams('projectCode'),
  asyncHandler(async (req, res) => {
    const result = await getEvaluatorsByProject(req, res);
    return result;
  })
);

// Get projects for evaluator by form
router.get('/:evaluatorID/projects/:formID',
  validateParams('evaluatorID'),
  validateParams('formID'),
  asyncHandler(async (req, res) => {
    const result = await getProjectsForEvaluatorByForm(req, res);
    return result;
  })
);

// Error handling middleware specific to evaluator routes
router.use((err, req, res, next) => {
  console.error('Evaluator route error:', err);

  // Handle specific evaluator-related errors
  if (err.code === 'evaluator/not-found') {
    return res.status(404).json({
      error: {
        message: 'Evaluator not found',
        status: 404
      }
    });
  }

  if (err.code === 'evaluator/already-exists') {
    return res.status(409).json({
      error: {
        message: 'Evaluator already exists',
        status: 409
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