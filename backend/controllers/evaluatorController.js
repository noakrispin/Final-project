const admin = require("firebase-admin");
const { sendEmail } = require("../utils/emailService");
const { appendDoNotReply } = require("../utils/emailUtils");

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
  try {
    console.log("Received request to send reminders.");
    

    const defaultMessage = 
  "You have pending project evaluations that require your attention. " + 
  "Please log in to the system to complete your evaluations." ;

    
    // Use the provided emailMessage or the default reminder template
    const emailBody = appendDoNotReply(req.body.message || defaultMessage);

    console.log("Final email message to be sent:", emailBody);

    const evaluatorsSnapshot = await admin
      .firestore()
      .collection("evaluators")
      .where("status", "==", "Not Submitted")
      .get();

    console.log(`Firestore returned ${evaluatorsSnapshot.size} results.`);

    if (evaluatorsSnapshot.empty) {
      console.log("No evaluators found with 'Not Submitted' status.");
      return res.status(404).json({ error: "No pending evaluators found to send reminders." });
    }

    const evaluatorEmails = new Set();
    evaluatorsSnapshot.docs.forEach((doc) => {
      const evaluatorData = doc.data();
      console.log(`Document: ${doc.id}, Evaluator Data:`, evaluatorData);

      if (evaluatorData.evaluatorID && evaluatorData.evaluatorID.includes("@")) {
        evaluatorEmails.add(evaluatorData.evaluatorID.trim());
      }
    });

    console.log(`Found ${evaluatorEmails.size} evaluators to notify:`, [...evaluatorEmails]);

    if (evaluatorEmails.size === 0) {
      return res.status(404).json({ error: "No valid evaluator emails found." });
    }

    console.log("Sending reminder emails...");

    const results = await Promise.allSettled(
      [...evaluatorEmails].map(async (email) => {
        try {
          await sendEmail(email, "Submission Reminder", emailBody);
          console.log(`Successfully sent reminder to ${email}`);
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error.message);
        }
      })
    );

    const successCount = results.filter((result) => result.status === "fulfilled").length;
    const failureCount = results.filter((result) => result.status === "rejected").length;

    console.log(`Successfully sent reminders to ${successCount} evaluators.`);
    console.log(`Failed to send reminders to ${failureCount} evaluators.`);

    res.status(201).json({
      success: true,
      message: `Reminders sent to ${successCount} pending evaluators. ${failureCount} failed.`,
    });
  } catch (error) {
    console.error("Error sending reminders:", error.message);
    res.status(500).json({ error: "Failed to send reminders.", details: error.message });
  }
};



