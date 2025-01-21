const express = require("express");
const { addUser, getUser, getAllUsers, deleteUser, updateUserRole } = require("../controllers/userController");

const router = express.Router();

// Add a new user
router.post("/", addUser);

// Fetch user details along with subcollections
router.get("/:id", getUser);

// Fetch all users
router.get("/", getAllUsers);

// Add the DELETE route
router.delete("/:id", deleteUser);

// Update user role
router.put("/:userId/role", updateUserRole);

module.exports = router;
