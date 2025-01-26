const admin = require("firebase-admin");


// Add or update a grade
exports.addOrUpdateGrade = async (req, res) => {
  const { projectCode } = req.params; // Passed in the route
  const { evaluatorID, formID, grades } = req.body; // Sent in the request body

  console.log("Received data for grade update:");
  console.log("Grades:", grades);
  console.log("EvaluatorID:", evaluatorID);
  console.log("ProjectCode:", projectCode);
  console.log("FormID:", formID);

  try {
    // Loop through grades to process updates for each student
    for (const [studentID, grade] of Object.entries(grades)) {
      console.log(`Processing studentID: ${studentID}, grade: ${grade}`);

      // Query Firestore for the grade document by `projectCode` and `studentID`
      const gradeSnapshot = await admin
        .firestore()
        .collection("finalGrades")
        .where("projectCode", "==", projectCode)
        .where("studentID", "==", studentID)
        .get();

      let gradeDocId;

      if (!gradeSnapshot.empty) {
        gradeDocId = gradeSnapshot.docs[0].id;
        console.log(`Found grade document for studentID ${studentID}: ${gradeDocId}`);
      } else {
        console.warn(`No grade document found for studentID: ${studentID}. Skipping.`);
        continue; // Skip to the next student
      }
      

      // Recalculate grades based on evaluations
      const evaluatorsSnapshot = await admin
        .firestore()
        .collection("evaluators")
        .where("projectCode", "==", projectCode)
        .get();

      let totalSupervisorGrade = 0;
      let totalPresentationGrade = 0;
      let totalBookGrade = 0;
      let supervisorCount = 0;
      let presentationCount = 0;
      let bookCount = 0;

      for (const evaluatorDoc of evaluatorsSnapshot.docs) {
        const evaluator = evaluatorDoc.data();

        if (evaluator.status === "Submitted") {
          const evaluationSnapshot = await admin
            .firestore()
            .collection("forms")
            .doc(formID)
            .collection("evaluations")
            .where("evaluatorID", "==", evaluator.evaluatorID)
            .where("projectCode", "==", projectCode)
            .get();

          for (const evaluationDoc of evaluationSnapshot.docs) {
            const evaluation = evaluationDoc.data();
            const evaluationGrades = evaluation.grades || {};

            if (evaluationGrades[studentID] !== undefined) {
              switch (evaluator.formID) {
                case "SupervisorForm":
                  totalSupervisorGrade += evaluationGrades[studentID];
                  supervisorCount++;
                  break;
                case "PresentationFormA":
                case "PresentationFormB":
                  totalPresentationGrade += evaluationGrades[studentID];
                  presentationCount++;
                  break;
                case "bookReviewerFormA":
                case "bookReviewerFormB":
                  totalBookGrade += evaluationGrades[studentID];
                  bookCount++;
                  break;
                default:
                  console.log(`Unknown formID: ${evaluator.formID}`);
              }
            }
          }
        }
      }

      const calculatedSupervisorGrade =
        supervisorCount > 0 ? totalSupervisorGrade / supervisorCount : null;
      const calculatedPresentationGrade =
        presentationCount > 0 ? totalPresentationGrade / presentationCount : null;
      const calculatedBookGrade =
        bookCount > 0 ? totalBookGrade / bookCount : null;

      let status = "Partially graded";

      const allSubmitted = evaluatorsSnapshot.docs.every(
        (doc) => doc.data().status === "Submitted"
      );
      const noneSubmitted = evaluatorsSnapshot.docs.every(
        (doc) => doc.data().status !== "Submitted"
      );

      if (allSubmitted) status = "Fully graded";
      else if (noneSubmitted) status = "Not graded";

      const finalGrade =
        (calculatedSupervisorGrade || 0) * 0.5 +
        (calculatedPresentationGrade || 0) * 0.25 +
        (calculatedBookGrade || 0) * 0.25;

      // Update the grade document
      await admin.firestore().collection("finalGrades").doc(gradeDocId).update({
        CalculatedSupervisorGrade: calculatedSupervisorGrade || null,
        CalculatedPresentationGrade: calculatedPresentationGrade || null,
        CalculatedBookGrade: calculatedBookGrade || null,
        finalGrade: finalGrade || null,
        status,
        updated_at: new Date().toISOString(),
      });

      console.log(`Updated grade document ${gradeDocId} for studentID ${studentID}`);
    }

    console.log("Grades processed successfully.");
    res.status(200).json({ success: true, message: "Grades updated successfully." });
  } catch (error) {
    console.error("Error updating grades:", error.message);
    res.status(500).json({ success: false, error: "Failed to update grades." });
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

