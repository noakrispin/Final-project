require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const formRoutes = require("./routes/formRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const evaluatorRoutes = require("./routes/evaluatorRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/evaluators", evaluatorRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
