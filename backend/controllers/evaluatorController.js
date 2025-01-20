const admin = require("firebase-admin");

// Add or update an evaluator
exports.addOrUpdateEvaluator = async (req, res) => {
  const { formID, projectCode, status, evaluatorID } = req.body;

  try {
    const evaluatorsRef = admin.firestore().collection("evaluators");

    // Query Firestore for an existing evaluator with the same evaluatorID, projectCode, and formID
    const querySnapshot = await evaluatorsRef
      .where("evaluatorID", "==", evaluatorID)
      .where("projectCode", "==", projectCode)
      .where("formID", "==", formID)
      .get();

    if (!querySnapshot.empty) {
      // Update the existing document
      const docId = querySnapshot.docs[0].id; // Get the document ID of the first matching record
      await evaluatorsRef.doc(docId).set(
        { evaluatorID, formID, projectCode, status },
        { merge: true } // Merge to avoid overwriting other fields
      );

      res.status(200).json({ success: true, message: "Evaluator record updated successfully" });
    } else {
      // Create a new document if no matching record exists
      const newDocRef = evaluatorsRef.doc(); // Generate a new document ID
      await newDocRef.set({
        evaluatorID,
        formID,
        projectCode,
        status,
      });

      res.status(201).json({ success: true, message: "New evaluator record created successfully" });
    }
  } catch (error) {
    console.error("Error adding/updating evaluator:", error.message);
    res.status(500).json({ success: false, error: "Failed to add/update evaluator" });
  }
};


// Get a specific evaluator by ID
exports.getEvaluator = async (req, res) => {
  const { id } = req.params;

  try {
    const evaluatorDoc = await admin.firestore().collection("evaluators").doc(id).get();
    if (!evaluatorDoc.exists) {
      return res.status(404).json({ success: false, error: "Evaluator not found" });
    }
    res.status(200).json({ success: true, data: evaluatorDoc.data() });
  } catch (error) {
    console.error("Error fetching evaluator:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch evaluator" });
  }
};


// Get all evaluators
exports.getAllEvaluators = async (req, res) => {
  try {
    const evaluatorsSnapshot = await admin.firestore().collection("evaluators").get();
    const evaluators = evaluatorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json({ success: true, data: evaluators });
  } catch (error) {
    console.error("Error fetching evaluators:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch evaluators" });
  }
};

// Delete an evaluator
exports.deleteEvaluator = async (req, res) => {
  const { id } = req.params;

  try {
    await admin.firestore().collection("evaluators").doc(id).delete();
    res.status(200).json({ success: true, message: "Evaluator deleted successfully" });
  } catch (error) {
    console.error("Error deleting evaluator:", error.message);
    res.status(500).json({ success: false, error: "Failed to delete evaluator" });
  }
};

// Get all projects assigned to a particular evaluator
exports.getProjectsByEvaluator = async (req, res) => {
  const { evaluatorID } = req.params;

  try {
    const evaluatorsSnapshot = await admin
      .firestore()
      .collection("evaluators")
      .where("evaluatorID", "==", evaluatorID)
      .get();

    if (evaluatorsSnapshot.empty) {
      return res.status(200).json({ success: true, data: [] }); // Return an empty array instead of 404
    }

    const projects = evaluatorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects for evaluator:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch projects for evaluator" });
  }
};


// Get evaluators assigned to a specific project
exports.getEvaluatorsByProject = async (req, res) => {
  const { projectCode } = req.params;

  try {
    const evaluatorsSnapshot = await admin
      .firestore()
      .collection("evaluators")
      .where("projectCode", "==", projectCode)
      .get();

    if (evaluatorsSnapshot.empty) {
      return res.status(404).json({ success: false, error: "No evaluators found for this project" });
    }

    const evaluators = evaluatorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, data: evaluators });
  } catch (error) {
    console.error("Error fetching evaluators for project:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch evaluators for project" });
  }
};
