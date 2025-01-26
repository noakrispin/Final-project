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

    // Initialize variables to calculate new grades
    let totalSupervisorGrade = existingGrades.CalculatedSupervisorGrade || 0;
    let totalPresentationGrade = existingGrades.CalculatedPresentationGrade || 0;
    let totalBookGrade = existingGrades.CalculatedBookGrade || 0;
    let supervisorCount = existingGrades.CalculatedSupervisorGrade ? 1 : 0;
    let presentationCount = existingGrades.CalculatedPresentationGrade ? 1 : 0;
    let bookCount = existingGrades.CalculatedBookGrade ? 1 : 0;

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
                console.warn(`Unhandled formID: ${formID}`);
            }
          }
        }
      }
    }

    // Recalculate weighted grades
    const calculatedSupervisorGrade =
      supervisorCount > 0 ? totalSupervisorGrade / supervisorCount : null;
    const calculatedPresentationGrade =
      presentationCount > 0 ? totalPresentationGrade / presentationCount : null;
    const calculatedBookGrade =
      bookCount > 0 ? totalBookGrade / bookCount : null;

    // Adjust weights dynamically based on available grades
    let totalWeight = 0;
    let weightedGrade = 0;

    if (calculatedSupervisorGrade !== null) {
      totalWeight += 0.5;
      weightedGrade += calculatedSupervisorGrade * 0.5;
    }
    if (calculatedPresentationGrade !== null) {
      totalWeight += 0.25;
      weightedGrade += calculatedPresentationGrade * 0.25;
    }
    if (calculatedBookGrade !== null) {
      totalWeight += 0.25;
      weightedGrade += calculatedBookGrade * 0.25;
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
      CalculatedSupervisorGrade: calculatedSupervisorGrade,
      CalculatedPresentationGrade: calculatedPresentationGrade,
      CalculatedBookGrade: calculatedBookGrade,
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

