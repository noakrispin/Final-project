const express = require("express");
const {
  addOrUpdateGrade,
  getGrade,
  getAllGrades,
  deleteGrade,
} = require("../controllers/gradeController");

const router = express.Router();

// Add or update a grade
router.post("/", addOrUpdateGrade);

// Get a specific grade
router.get("/:id", getGrade);

// Get all grades
router.get("/", getAllGrades);

// Delete a grade
router.delete("/:id", deleteGrade);

module.exports = router;
