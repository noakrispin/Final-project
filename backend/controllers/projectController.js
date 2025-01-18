const admin = require("firebase-admin");

// Add a new project
exports.addProject = async (req, res) => {
  const { projectCode, data } = req.body;

  try {
    if (!projectCode || !data) {
      return res.status(400).json({ error: "Project code and data are required" });
    }

    // Add the project to the "projects" collection
    await admin.firestore().collection("projects").doc(projectCode).set(data);
    res.status(201).json({ message: "Project added successfully" });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ error: "Failed to add project" });
  }
};

// Get details of a specific project
exports.getProject = async (req, res) => {
  const { projectCode } = req.params;

  try {
    if (!projectCode) {
      return res.status(400).json({ error: "Project code is required" });
    }

    const projectDoc = await admin.firestore().collection("projects").doc(projectCode).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Include students and supervisor details if needed
    const projectData = projectDoc.data();

    res.status(200).json(projectData);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};


// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
      const projectsSnapshot = await admin.firestore().collection("projects").get();

      // If no documents exist, return an empty array
      if (projectsSnapshot.empty) {
          console.log("No projects found in Firestore.");
          return res.status(200).json([]);
      }

      const projects = projectsSnapshot.docs.map((doc) => {
          const projectData = doc.data();

          // Transform individual student fields into an array
          const students = [];
          if (projectData.Student1) students.push({ id: projectData.Student1.ID, name: projectData.Student1.fullName });
          if (projectData.Student2) students.push({ id: projectData.Student2.ID, name: projectData.Student2.fullName });

          return {
              projectCode: doc.id,
              ...projectData,
              students, // Replace separate student fields with the array
          };
      });

      res.status(200).json(projects);
  } catch (error) {
      console.error("Error fetching projects:", error.message);
      res.status(500).json({ error: "Failed to fetch projects" });
  }
};




// Update a project
exports.updateProject = async (req, res) => {
  const { projectCode } = req.params;
  const data = req.body;

  try {
    if (!projectCode || !data) {
      return res.status(400).json({ error: "Project code and data are required" });
    }

    await admin.firestore().collection("projects").doc(projectCode).update(data);
    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  const { projectCode } = req.params;

  try {
    if (!projectCode) {
      return res.status(400).json({ error: "Project code is required" });
    }

    await admin.firestore().collection("projects").doc(projectCode).delete();
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};
