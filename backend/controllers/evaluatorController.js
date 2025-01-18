const admin = require("firebase-admin");

// Add or update an evaluator
exports.addOrUpdateEvaluator = async (req, res) => {
  const { id, formID, projectCode, status, evaluatorID } = req.body;

  try {
    const evaluatorData = {
      evaluatorID,
      formID,
      projectCode,
      status,
    };

    await admin.firestore().collection("evaluators").doc(id).set(evaluatorData, { merge: true });
    res.status(201).json({ success: true, message: "Evaluator added/updated successfully" });
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

// Get all projects associated with a specific evaluator ID
exports.getEvaluatorProjects = async (req, res) => {
  const { id } = req.params;

  try {
    const evaluatorsSnapshot = await admin
      .firestore()
      .collection("evaluators")
      .where("evaluatorID", "==", id)
      .get();

    if (evaluatorsSnapshot.empty) {
      return res.status(404).json({ success: false, error: "No projects found for this evaluator" });
    }

    const projectCodes = evaluatorsSnapshot.docs.map((doc) => doc.data().projectCode);

    const projectsSnapshot = await admin
      .firestore()
      .collection("projects")
      .where(admin.firestore.FieldPath.documentId(), "in", projectCodes)
      .get();

    const projects = projectsSnapshot.docs.map((doc) => ({
      projectCode: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching evaluator projects:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch evaluator projects" });
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
      return res.status(404).json({ success: false, error: "No projects found for this evaluator" });
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
