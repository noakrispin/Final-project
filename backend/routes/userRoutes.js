const express = require("express");
const { addUser, getUser } = require("../controllers/userController");

const router = express.Router();

// Add a new user
router.post("/", addUser);

// Fetch user details along with subcollections
router.get("/:id", getUser);

module.exports = router;
