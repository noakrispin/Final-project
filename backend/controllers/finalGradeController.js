const admin = require("firebase-admin");


// Add or update a grade
exports.addOrUpdateGrade = async (req, res) => {
  const { projectCode, evaluationsByForm } = req.body;

  if (!projectCode || !evaluationsByForm || evaluationsByForm.length === 0) {
    return res.status(400).json({
      error: {
        message: "Missing required fields: projectCode or evaluationsByForm.",
        status: 400,
      },
    });
  }

  try {
    console.log(`Processing grades for projectCode: ${projectCode}`);

    // Extract all unique student IDs
    const studentIDs = new Set();
    evaluationsByForm.forEach((form) => {
      form.grades.forEach((entry) => studentIDs.add(entry.studentID));
    });

    // Iterate over each studentID and calculate grades
    for (const studentID of studentIDs) {
      console.log(`Processing grades for studentID: ${studentID}`);

      // Initialize grades
      let supervisorGrade = null;
      let presentationGrade = null;
      let bookGrade = null;

      // Process evaluations by formID
      evaluationsByForm.forEach((form) => {
        const { formID, grades } = form;

        // Find grades for the current student in this form
        const studentGrades = grades.find((entry) => entry.studentID === studentID);

        if (studentGrades && studentGrades.grades.length > 0) {
          const averageGrade =
            studentGrades.grades.reduce((sum, grade) => sum + grade, 0) /
            studentGrades.grades.length;

          switch (formID) {
            case "SupervisorForm":
              supervisorGrade = averageGrade;
              break;

            case "PresentationFormA":
            case "PresentationFormB":
              presentationGrade = averageGrade;
              break;

            case "bookReviewerFormA":
            case "bookReviewerFormB":
              bookGrade = averageGrade;
              break;

            default:
              console.warn(`Unhandled formID: ${formID}`);
          }
        }
      });

      // Calculate the final grade
      let totalWeight = 0;
      let weightedGrade = 0;

      if (supervisorGrade !== null) {
        totalWeight += 0.5;
        weightedGrade += supervisorGrade * 0.5;
      }

      if (presentationGrade !== null) {
        totalWeight += 0.25;
        weightedGrade += presentationGrade * 0.25;
      }

      if (bookGrade !== null) {
        totalWeight += 0.25;
        weightedGrade += bookGrade * 0.25;
      }

      const finalGrade = totalWeight > 0 ? weightedGrade / totalWeight : null;

      // Check if all evaluators have submitted their evaluations
      const evaluatorsSnapshot = await admin
        .firestore()
        .collection("evaluators")
        .where("projectCode", "==", projectCode)
        .get();

      const allSubmitted = evaluatorsSnapshot.docs.every(
        (doc) => doc.data().status === "Submitted"
      );
      const noneSubmitted = evaluatorsSnapshot.docs.every(
        (doc) => doc.data().status !== "Submitted"
      );

      const status = allSubmitted
        ? "Fully graded"
        : noneSubmitted
        ? "Not graded"
        : "Partially graded";

      // Check if a grade document exists for the student and project
      const gradeSnapshot = await admin
        .firestore()
        .collection("finalGrades")
        .where("projectCode", "==", projectCode)
        .where("studentID", "==", studentID)
        .get();

      if (!gradeSnapshot.empty) {
        // Update the existing grade document
        const gradeDocId = gradeSnapshot.docs[0].id;
        await admin.firestore().collection("finalGrades").doc(gradeDocId).update({
          CalculatedSupervisorGrade: supervisorGrade,
          CalculatedPresentationGrade: presentationGrade,
          CalculatedBookGrade: bookGrade,
          finalGrade,
          status,
          updated_at: new Date().toISOString(),
        });
        console.log(
          `Updated grade document for studentID: ${studentID}, projectCode: ${projectCode}`
        );
      } else {
        // Create a new grade document
        await admin.firestore().collection("finalGrades").add({
          studentID,
          projectCode,
          CalculatedSupervisorGrade: supervisorGrade,
          CalculatedPresentationGrade: presentationGrade,
          CalculatedBookGrade: bookGrade,
          finalGrade,
          status,
          created_at: new Date().toISOString(),
        });
        console.log(
          `Created new grade document for studentID: ${studentID}, projectCode: ${projectCode}`
        );
      }
    }

    res.status(200).json({ success: true, message: "Grades updated successfully." });
  } catch (error) {
    console.error("Error updating grades:", error.message);
    res.status(500).json({ success: false, error: "Failed to update grades." });
  }
};


exports.getGradesForProjects = async (req, res) => {
  const { projectCodes } = req.body; // Expect projectCodes as input

  if (!projectCodes || projectCodes.length === 0) {
    return res.status(400).json({ error: "Project codes are required." });
  }

  try {
    console.log(`Fetching grades for projects: ${projectCodes}`);

    // Fetch grades only for the received projectCodes
    const gradesSnapshot = await admin
      .firestore()
      .collection("finalGrades")
      .where("projectCode", "in", projectCodes)
      .get();

    if (gradesSnapshot.empty) {
      console.warn("No grades found for the given projects.");
      return res.status(200).json({ success: true, data: [] });
    }

    const grades = gradesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Grades fetched successfully:", grades);
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    console.error("Error fetching grades:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch grades." });
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
    console.log("Fetching all grades from Firestore...");
    const gradesSnapshot = await admin.firestore().collection("finalGrades").get();

    // Check if there are no documents in the collection
    if (gradesSnapshot.empty) {
      console.warn("No grades found in the finalGrades collection.");
      return res.status(200).json({ success: true, data: [] }); // Return empty data array with success: true
    }

    // Map through documents to extract grade data
    const grades = gradesSnapshot.docs.map((doc) => ({
      id: doc.id, 
      ...doc.data(), 
    }));

    console.log("Grades fetched successfully:", grades);

    // Return grades with success flag
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    console.error("Error fetching grades:", error.message);

    // Return error response
    res.status(500).json({
      success: false,
      error: "Failed to fetch grades. Please try again later.",
    });
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

