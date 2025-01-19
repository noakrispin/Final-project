const admin = require("firebase-admin");

// Add or update a grade
exports.addOrUpdateGrade = async (req, res) => {
  const { id, projectCode, studentID, calculatedGrades, status } = req.body;

  try {
    // Create grade data
    const gradeData = {
      ...calculatedGrades,
      projectCode,
      studentID,
      status,
      updatedAt: new Date(),
    };

    // Add or update the grade in the `finalGrades` collection
    await admin.firestore().collection("finalGrades").doc(id).set(gradeData, { merge: true });
    res.status(201).json({ success: true, message: "Grade added/updated successfully" });
  } catch (error) {
    console.error("Error adding/updating grade:", error.message);
    res.status(500).json({ success: false, error: "Failed to add/update grade" });
  }
};

// Get a specific grade by ID
exports.getGrade = async (req, res) => {
  const { id } = req.params;

  try {
    const gradeDoc = await admin.firestore().collection("finalGrades").doc(id).get();
    if (!gradeDoc.exists) {
      return res.status(404).json({ success: false, error: "Grade not found" });
    }

    res.status(200).json({ success: true, data: gradeDoc.data() });
  } catch (error) {
    console.error("Error fetching grade:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch grade" });
  }
};

// Get all grades
exports.getAllGrades = async (req, res) => {
  try {
    const gradesSnapshot = await admin.firestore().collection("finalGrades").get();
    if (gradesSnapshot.empty) {
      return res.status(404).json({ success: false, error: "No grades found" });
    }

    const grades = gradesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    console.error("Error fetching grades:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch grades" });
  }
};

// Delete a grade
exports.deleteGrade = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the grade exists before deletion
    const gradeDoc = await admin.firestore().collection("finalGrades").doc(id).get();
    if (!gradeDoc.exists) {
      return res.status(404).json({ success: false, error: "Grade not found" });
    }

    await admin.firestore().collection("finalGrades").doc(id).delete();
    res.status(200).json({ success: true, message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting grade:", error.message);
    res.status(500).json({ success: false, error: "Failed to delete grade" });
  }
};
