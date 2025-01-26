const admin = require("firebase-admin");


// Add or update a grade
exports.addOrUpdateGrade = async (req, res) => {
  const { formID, grade, studentID, projectCode } = req.body;

  try {
    console.log(`Processing studentID: ${studentID}, grade: ${grade}`);

    // Query Firestore for the grade document by `projectCode` and `studentID`
    const gradeSnapshot = await admin
      .firestore()
      .collection("finalGrades")
      .where("projectCode", "==", projectCode)
      .where("studentID", "==", studentID)
      .get();

    let gradeDocId;
    let existingGrades = {
      CalculatedSupervisorGrade: null,
      CalculatedPresentationGrade: null,
      CalculatedBookGrade: null,
    };

    if (!gradeSnapshot.empty) {
      gradeDocId = gradeSnapshot.docs[0].id;
      const gradeData = gradeSnapshot.docs[0].data();

      // Retain existing grades
      existingGrades.CalculatedSupervisorGrade = gradeData.CalculatedSupervisorGrade || null;
      existingGrades.CalculatedPresentationGrade = gradeData.CalculatedPresentationGrade || null;
      existingGrades.CalculatedBookGrade = gradeData.CalculatedBookGrade || null;

      console.log(`Found grade document for studentID ${studentID}: ${gradeDocId}`);
    } else {
      console.warn(`No grade document found for studentID: ${studentID}. Creating a new document.`);
      const newDocRef = await admin.firestore().collection("finalGrades").add({
        projectCode,
        studentID,
        CalculatedSupervisorGrade: null,
        CalculatedPresentationGrade: null,
        CalculatedBookGrade: null,
        finalGrade: null,
        status: "Not graded",
        created_at: new Date().toISOString(),
      });
      gradeDocId = newDocRef.id;
    }

    // Initialize variables for counting evaluators
    let supervisorEvaluatorCount = 0;
    let presentationEvaluatorCount = 0;
    let bookEvaluatorCount = 0;

    // Fetch evaluations from evaluators
    const evaluatorsSnapshot = await admin
      .firestore()
      .collection("evaluators")
      .where("projectCode", "==", projectCode)
      .get();

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
            switch (formID) {
              case "SupervisorForm":
                existingGrades.CalculatedSupervisorGrade =
                  existingGrades.CalculatedSupervisorGrade !== null
                    ? (existingGrades.CalculatedSupervisorGrade * supervisorEvaluatorCount + evaluationGrades[studentID]) /
                      (supervisorEvaluatorCount + 1)
                    : evaluationGrades[studentID];
                supervisorEvaluatorCount++;
                break;
              case "PresentationFormA":
              case "PresentationFormB":
                existingGrades.CalculatedPresentationGrade =
                  existingGrades.CalculatedPresentationGrade !== null
                    ? (existingGrades.CalculatedPresentationGrade * presentationEvaluatorCount + evaluationGrades[studentID]) /
                      (presentationEvaluatorCount + 1)
                    : evaluationGrades[studentID];
                presentationEvaluatorCount++;
                break;
              case "bookReviewerFormA":
              case "bookReviewerFormB":
                existingGrades.CalculatedBookGrade =
                  existingGrades.CalculatedBookGrade !== null
                    ? (existingGrades.CalculatedBookGrade * bookEvaluatorCount + evaluationGrades[studentID]) /
                      (bookEvaluatorCount + 1)
                    : evaluationGrades[studentID];
                bookEvaluatorCount++;
                break;
              default:
                console.warn(`Unhandled formID: ${formID}`);
            }
          }
        }
      }
    }

    // Adjust weights dynamically based on available grades
    let totalWeight = 0;
    let weightedGrade = 0;

    if (existingGrades.CalculatedSupervisorGrade !== null) {
      totalWeight += 0.5;
      weightedGrade += existingGrades.CalculatedSupervisorGrade * 0.5;
    }
    if (existingGrades.CalculatedPresentationGrade !== null) {
      totalWeight += 0.25;
      weightedGrade += existingGrades.CalculatedPresentationGrade * 0.25;
    }
    if (existingGrades.CalculatedBookGrade !== null) {
      totalWeight += 0.25;
      weightedGrade += existingGrades.CalculatedBookGrade * 0.25;
    }

    const finalGrade = totalWeight > 0 ? weightedGrade / totalWeight : null;

    // Determine the status of grading
    let status = "Partially graded";
    const allSubmitted = evaluatorsSnapshot.docs.every(
      (doc) => doc.data().status === "Submitted"
    );
    const noneSubmitted = evaluatorsSnapshot.docs.every(
      (doc) => doc.data().status !== "Submitted"
    );

    if (allSubmitted) status = "Fully graded";
    else if (noneSubmitted) status = "Not graded";

    // Update or create the grade document
    await admin.firestore().collection("finalGrades").doc(gradeDocId).update({
      CalculatedSupervisorGrade: existingGrades.CalculatedSupervisorGrade,
      CalculatedPresentationGrade: existingGrades.CalculatedPresentationGrade,
      CalculatedBookGrade: existingGrades.CalculatedBookGrade,
      finalGrade: finalGrade,
      status,
      updated_at: new Date().toISOString(),
    });

    console.log(`Updated grade document ${gradeDocId} for studentID ${studentID}`);
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

