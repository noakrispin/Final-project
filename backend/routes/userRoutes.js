const express = require("express");
const { addUser, getUser,getAllUsers  } = require("../controllers/userController");

const router = express.Router();

// Add a new user
router.post("/", addUser);

// Fetch user details along with subcollections
router.get("/:id", getUser);

// Fetch all users
router.get("/", getAllUsers); 

module.exports = router;
