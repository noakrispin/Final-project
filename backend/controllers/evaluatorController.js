const admin = require("firebase-admin");

// Add or update an evaluator
exports.addOrUpdateEvaluator = async (req, res) => {
  const { formID, projectCode, status, evaluatorID } = req.body;
  console.log("addOrUpdateEvaluator Request Body:", req.body);

  try {
    if (!evaluatorID || !formID || !projectCode) {
      return res.status(400).json({ error: { message: "Missing required fields", status: 400 } });
    }

    const evaluatorsRef = admin.firestore().collection("evaluators");

    // Query Firestore for an existing evaluator
    const querySnapshot = await evaluatorsRef
      .where("evaluatorID", "==", evaluatorID.trim()) // Trim to avoid extra spaces
      .where("projectCode", "==", projectCode.trim())
      .where("formID", "==", formID.trim())
      .get();

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;

      console.log("Updating existing evaluator record:", docId);
      await evaluatorsRef.doc(docId).set(
        { evaluatorID: evaluatorID.trim(), formID, projectCode, status },
        { merge: true }
      );

      return res.status(200).json({ success: true, message: "Evaluator record updated successfully" });
    } else {
      console.log("No matching evaluator found. Creating new record.");

      await evaluatorsRef.add({
        evaluatorID: evaluatorID.trim(),
        formID,
        projectCode,
        status,
      });

      return res.status(201).json({ success: true, message: "New evaluator record created successfully" });
    }
  } catch (error) {
    console.error("Error adding/updating evaluator:", error.message);
    res.status(500).json({ error: "Failed to add/update evaluator" });
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


exports.getProjectsForEvaluatorByForm = async (req, res) => {
  const { evaluatorID, formID } = req.params; // Fetch both evaluatorID and formID

  try {
    const evaluatorsRef = admin.firestore().collection("evaluators");
    const projectsRef = admin.firestore().collection("projects");

    // Query evaluators collection for the given evaluatorID and formID
    const evaluatorSnapshot = await evaluatorsRef
      .where("evaluatorID", "==", evaluatorID)
      .where("formID", "==", formID)
      .get();

      if (evaluatorSnapshot.empty) {
        return res.status(200).json({ success: true, data: [] });
      }
      
    const evaluatorData = evaluatorSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch corresponding projects based on projectCode
    const projectPromises = evaluatorData.map((evaluator) =>
      projectsRef.doc(evaluator.projectCode).get()
    );

    const projectSnapshots = await Promise.all(projectPromises);

    // Combine evaluator data with project data
    const projects = projectSnapshots.map((snapshot, index) => {
      if (!snapshot.exists) return null;
      return {
        ...snapshot.data(),
        evaluatorDetails: evaluatorData[index],
      };
    }).filter(Boolean);

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects for evaluator:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch projects for evaluator." });
  }
};

//reminders controller - send reminders only to evaluators with status = "Not Submitted"
exports.sendRemindersToEvaluators = async (req, res) => {
  const { message } = req.body;

  // Default reminder message
  const defaultTemplate =
    "This is a reminder to submit your project evaluation. Please log in to the system to complete your assessment.";
  const finalMessage = message || defaultTemplate;

  try {
    // Fetch evaluators where status is "Not Submitted"
    const evaluatorsSnapshot = await admin
      .firestore()
      .collection("evaluators")
      .where("status", "==", "Not Submitted")
      .get();

    // Extract evaluator emails (removing duplicates using Set)
    const evaluatorEmails = new Set(
      evaluatorsSnapshot.docs
        .map((doc) => doc.data().evaluatorID) // evaluatorID is the email
        .filter(Boolean) // Exclude null or undefined emails
    );

    console.log(`Fetched ${evaluatorEmails.size} unique evaluators who have not submitted.`);

    if (evaluatorEmails.size === 0) {
      return res.status(404).json({ error: "No pending evaluators found to send reminders." });
    }

    // Send emails to only unique evaluators
    const results = await Promise.allSettled(
      [...evaluatorEmails].map((email) =>
        sendEmail(email, "Submission Reminder", finalMessage)
      )
    );

    const successCount = results.filter((result) => result.status === "fulfilled").length;
    const failureCount = results.filter((result) => result.status === "rejected").length;

    if (failureCount > 0) {
      console.error(`Failed to send emails to ${failureCount} evaluators.`);
    }

    // Respond with a summary
    res.status(201).json({
      success: true,
      message: `Reminders sent to ${successCount} pending evaluators. ${failureCount} failed.`,
    });
  } catch (error) {
    console.error("Error sending reminders:", error.message);
    res.status(500).json({ error: "Failed to send reminders.", details: error.message });
  }
};
