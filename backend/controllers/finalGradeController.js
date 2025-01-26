const admin = require("firebase-admin");

// Add or update a grade
exports.addOrUpdateGrade = async (req, res) => {
  const { projectCode } = req.params;
  const { evaluatorID, formID, grades } = req.body;
  console.log("Updating finalGrades(controller)...");
  console.log("Received grades:", grades);
  console.log("Received evaluatorID:", evaluatorID);
  console.log("Received projectCode:", projectCode);
  console.log("Received formID:", formID);
  try {
    console.log("Updating finalGrades...");
    console.log("Received grades:", grades);

    const finalGradesSnapshot = await db
      .collection("finalGrades")
      .where("projectCode", "==", projectCode)
      .get();

    // Process each studentID from the received grades
    for (const [studentID, grade] of Object.entries(grades)) {
      console.log(`Processing studentID: ${studentID}, Grade: ${grade}`);

      // Find the matching document for the student
      const matchingDoc = finalGradesSnapshot.docs.find(
        (doc) => doc.data().studentID === studentID
      );

      let finalGradeDocId;
      if (matchingDoc) {
        // If a matching document is found, get its ID
        finalGradeDocId = matchingDoc.id;
        console.log(`Found matching document for student ${studentID}:`, finalGradeDocId);
      } else {
        // If no matching document, create a new one
        const newDocRef = await db.collection("finalGrades").add({
          studentID,
          projectCode,
          status: "Not graded",
          CalculatedSupervisorGrade: null,
          CalculatedPresentationGrade: null,
          CalculatedBookGrade: null,
          finalGrade: null,
          updated_at: new Date().toISOString(),
        });
        finalGradeDocId = newDocRef.id;
        console.log(`Created new document for student ${studentID}:`, finalGradeDocId);
      }

      // Calculate averages for each grade component
      const evaluatorsSnapshot = await db
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
        console.log("Evaluator:", evaluator);

        if (evaluator.status === "Submitted") {
          const evaluationSnapshot = await db
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

      console.log(`Grade Averages for student ${studentID}:`, {
        calculatedSupervisorGrade,
        calculatedPresentationGrade,
        calculatedBookGrade,
      });

      // Determine status
      let status = "Partially graded";

      const allSubmitted = evaluatorsSnapshot.docs.every(
        (evaluatorDoc) => evaluatorDoc.data().status === "Submitted"
      );
      const noneSubmitted = evaluatorsSnapshot.docs.every(
        (evaluatorDoc) => evaluatorDoc.data().status !== "Submitted"
      );

      if (allSubmitted) {
        status = "Fully graded";
      } else if (noneSubmitted) {
        status = "Not graded";
      }

      // Calculate final grade
      const finalGrade =
        (calculatedSupervisorGrade || 0) * 0.5 +
        (calculatedPresentationGrade || 0) * 0.25 +
        (calculatedBookGrade || 0) * 0.25;

      // Update finalGrades document
      await db.collection("finalGrades").doc(finalGradeDocId).update({
        CalculatedSupervisorGrade: calculatedSupervisorGrade || null,
        CalculatedPresentationGrade: calculatedPresentationGrade || null,
        CalculatedBookGrade: calculatedBookGrade || null,
        finalGrade: finalGrade || null,
        status,
        updated_at: new Date().toISOString(),
      });

      console.log(`Updated final grade for student ${studentID}:`, {
        finalGrade,
        status,
      });
    }

    console.log("Final grades updated successfully.");
    res.status(200).json({ success: true, message: "Final grades updated successfully." });
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

