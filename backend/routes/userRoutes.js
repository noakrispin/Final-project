const express = require("express");
const { addDocument, getDocument } = require("../utils/firebaseHelper");

const router = express.Router();

// Add a user
router.post("/add", async (req, res) => {
  const { id, fullName, email, role, password } = req.body;
  const response = await addDocument("users", id, { id, fullName, email, role, password });
  res.json(response);
});

// Get a user
router.get("/:id", async (req, res) => {
  const response = await getDocument("users", req.params.id);
  res.json(response);
});

module.exports = router;
