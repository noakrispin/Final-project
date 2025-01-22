require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const formRoutes = require("./routes/formRoutes");
const finalGradeRoutes = require("./routes/finalGradeRoutes");
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
app.use("/api/grades", finalGradeRoutes);
app.use("/api/evaluators", evaluatorRoutes);


// Start the server only if this file is executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the app for serverless use
module.exports = app;
