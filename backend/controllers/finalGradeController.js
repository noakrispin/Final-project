const admin = require("firebase-admin");

// Add or update a grade
exports.addOrUpdateGrade = async (req, res) => {
  const { formID } = req.params;
    const { evaluatorID, projectCode, general, students } = req.body;
  try {
    console.log("Updating finalGrades...");

    const finalGradesSnapshot = await db
      .collection("finalGrades")
      .where("projectCode", "==", projectCode)
      // .where("part", "==", part)
      .get();
 
    console.log("finalGradesSnapshot:", finalGradesSnapshot);
 
    if (!finalGradesSnapshot.empty) {
      for (const doc of finalGradesSnapshot.docs) {
        const finalGradeDoc = doc.data();
        const studentID = finalGradeDoc.studentID;
 
        console.log(`Processing final grades for studentID: ${studentID}`);
 
        // Calculate averages for each grade component
        const evaluatorsSnapshot = await db
          .collection("evaluators")
          .where("projectCode", "==", projectCode)
          .get();
 
          console.log("evaluatorsSnapshot:", evaluatorsSnapshot);
        let totalSupervisorGrade = 0;
        let totalPresentationGrade = 0;
        let totalBookGrade = 0;
 
        let supervisorCount = 0;
        let presentationCount = 0;
        let bookCount = 0;
 
        for (const evaluatorDoc of evaluatorsSnapshot.docs) {
          const evaluator = evaluatorDoc.data();
          console.log("evaluator:", evaluator);
          if (evaluator.status === "Submitted") {
            const evaluationSnapshot = await db
              .collection("forms")
              .doc(evaluator.formID)
              .collection("evaluations")
              .where("evaluatorID", "==", evaluator.evaluatorID)
              .where("projectCode", "==", projectCode)
              .get();
 
            for (const evaluationDoc of evaluationSnapshot.docs) {
              const evaluation = evaluationDoc.data();
              const grades = evaluation.grades || {};
              console.log("grades:", grades);
              console.log("evaluation(in loop):", evaluation);
              if (grades[studentID] !== undefined) {
                switch (evaluator.formID) {
                  case "SupervisorForm":
                    console.log("SupervisorForm:grades[studentID]", grades[studentID]);
                    totalSupervisorGrade += grades[studentID];
                    supervisorCount++;
                    break;
                  case "PresentationFormA":
                    totalPresentationGrade += grades[studentID];
                    presentationCount++;
                    break;
                  case "PresentationFormB":
                    console.log("PresentationFormB:grades[studentID]", grades[studentID]);
                    totalPresentationGrade += grades[studentID];
                    presentationCount++;
                    break;
                  case "bookReviewerFormA":
                    totalBookGrade += grades[studentID];
                    bookCount++;
                    break;
                  case "bookReviewerFormB":
                    totalBookGrade += grades[studentID];
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
        await db.collection("finalGrades").doc(doc.id).update({
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
 
      console.log("finalGrades updated successfully.");
      res.status(200).json({ success: true, message: "Final grades updated successfully." });
    } else {
      console.log("No matching finalGrades document found for the project and student.");
    }
 
    
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

