const db = require("../config/firebaseAdmin"); // Firebase admin setup

module.exports = {
  /* -------------------------forms--------------------------*/

  // Create a new form with subcollections
  createForm: async (req, res) => {
    const { formID, description, formName } = req.body;

    if (!formID || !formName) {
      return res.status(400).json({ message: "Form ID and Form Name are required." });
    }

    try {
      await db.collection("forms").doc(formID).set({
        description: description || "",
        formName,
        created_at: new Date().toISOString(),
      });

      res.status(201).json({ message: "Form created successfully." });
    } catch (error) {
      console.error("Error creating form:", error.message);
      res.status(500).json({ message: "Failed to create form." });
    }
  },

  // Update a specific form
  updateForm: async (req, res) => {
    const { formID } = req.params;
    const updatedData = req.body;

    if (!formID || !updatedData) {
      return res.status(400).json({ message: "Form ID and updated data are required." });
    }

    try {
      await db.collection("forms").doc(formID).update(updatedData);
      res.status(200).json({ message: "Form updated successfully." });
    } catch (error) {
      console.error("Error updating form:", error.message);
      res.status(500).json({ message: "Failed to update form." });
    }
  },


  // Fetch a specific form
  getForm: async (req, res) => {
    const { formID } = req.params;

    if (!formID) {
      return res.status(400).json({ message: "Form ID is required." });
    }

    try {
      const formDoc = await db.collection("forms").doc(formID).get();

      if (!formDoc.exists) {
        return res.status(404).json({ message: "Form not found." });
      }

      res.status(200).json({ id: formDoc.id, ...formDoc.data() });
    } catch (error) {
      console.error("Error fetching form:", error.message);
      res.status(500).json({ message: "Failed to fetch form." });
    }
  },

  // Delete a form along with its subcollections
  deleteForm: async (req, res) => {
    const { formID } = req.params;

    if (!formID) {
      return res.status(400).json({ message: "Form ID is required." });
    }

    try {
      const formRef = db.collection("forms").doc(formID);

      // Function to delete all documents in a subcollection
      const deleteSubcollection = async (subcollection) => {
        const snapshot = await formRef.collection(subcollection).get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      };

      // Delete subcollections
      await Promise.all([
        deleteSubcollection("questions"),
        deleteSubcollection("responses"),
        deleteSubcollection("evaluations"),
      ]);

      // Delete the form document
      await formRef.delete();

      res.status(200).json({ message: "Form and its subcollections deleted successfully." });
    } catch (error) {
      console.error("Error deleting form:", error.message);
      res.status(500).json({ message: "Failed to delete form." });
    }
  },

  /* -------------------------form's questions (questions subCollection) --------------------------*/

  // Fetch questions for a specific form
  getQuestions: async (req, res) => {
    const { formID } = req.params;
    console.log("Received formID:", formID); // Debug log
    if (!formID) {
      return res.status(400).json({ message: "Form ID is required." });
    }
  
    try {
      const questionsSnapshot = await db.collection("forms").doc(formID).collection("questions").get();
      const questions = questionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Questions fetched:", questions); // Debug log
      res.status(200).json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions." });
    }
  },
  


  // Add a new question to a form
  addQuestion: async (req, res) => {
    const { formID } = req.params;
    const questionData = req.body;

    if (!formID || !questionData) {
      return res.status(400).json({ message: "Form ID and question data are required." });
    }

    try {
      const newQuestion = await db.collection("forms").doc(formID).collection("questions").add(questionData);
      res.status(201).json({ message: "Question added successfully.", id: newQuestion.id });
    } catch (error) {
      console.error("Error adding question:", error.message);
      res.status(500).json({ message: "Failed to add question." });
    }
  },

  // Update a specific question in a form
  updateQuestion: async (req, res) => {
    const { formID, questionId } = req.params;
    const updatedData = req.body;

    if (!formID || !questionId || !updatedData) {
      return res.status(400).json({ message: "Form ID, question ID, and updated data are required." });
    }

    try {
      await db
        .collection("forms")
        .doc(formID)
        .collection("questions")
        .doc(questionId)
        .update(updatedData);
      res.status(200).json({ message: "Question updated successfully." });
    } catch (error) {
      console.error("Error updating question:", error.message);
      res.status(500).json({ message: "Failed to update question." });
    }
  },

  // Delete a specific question from a form
  deleteQuestion: async (req, res) => {
    const { formID, questionId } = req.params;

    if (!formID || !questionId) {
      return res.status(400).json({ message: "Form ID and question ID are required." });
    }

    try {
      await db.collection("forms").doc(formID).collection("questions").doc(questionId).delete();
      res.status(200).json({ message: "Question deleted successfully." });
    } catch (error) {
      console.error("Error deleting question:", error.message);
      res.status(500).json({ message: "Failed to delete question." });
    }
  },


  /* -------------------------form's responses (responses subCollection) --------------------------*/

  // Submit form data
  submitForm: async (req, res) => {
    const { formID } = req.params;
    const { evaluatorID, projectCode, general, students } = req.body;
  
    if (!formID || !evaluatorID || !projectCode || !general || !students) {
      return res.status(400).json({
        message: "Form ID, evaluator ID, project code, general responses, and student responses are required.",
      });
    }
  
    try {
      // Check if a response already exists
      const existingResponsesSnapshot = await db
        .collection("forms")
        .doc(formID)
        .collection("responses")
        .where("evaluatorID", "==", evaluatorID)
        .where("projectCode", "==", projectCode)
        .get();
  
      if (!existingResponsesSnapshot.empty) {
        // If response exists, update it
        const responseRef = existingResponsesSnapshot.docs[0].ref; // Get the first response document reference
        await responseRef.update({
          general,
          students,
          updated_at: new Date().toISOString(), // Add an `updated_at` timestamp
        });
        return res.status(200).json({ message: "Response updated successfully." });
      }
  
      // If no response exists, create a new one
      await db
        .collection("forms")
        .doc(formID)
        .collection("responses")
        .add({
          evaluatorID,
          projectCode,
          general,
          students,
          created_at: new Date().toISOString(),
        });
  
      res.status(201).json({ message: "Response submitted successfully." });
    } catch (error) {
      console.error("Error submitting response:", error.message);
      res.status(500).json({ message: "Failed to submit response." });
    }
  },
  
  
  

  // Fetch form responses
getResponses: async (req, res) => {
  const { formID } = req.params;
  const { evaluatorID, studentID } = req.query; // Optional student ID filter

  if (!formID || !evaluatorID) {
    return res.status(400).json({ message: "Form ID and evaluator ID are required." });
  }

  try {
    const responsesRef = db.collection("forms").doc(formID).collection("responses");
    const responseSnapshot = await responsesRef.where("evaluatorID", "==", evaluatorID).get();

    if (responseSnapshot.empty) {
      return res.status(404).json({ message: "No response found for the evaluator." });
    }

    const response = responseSnapshot.docs[0].data();
    const studentResponses = studentID ? response.students[studentID] : response.students;

    res.status(200).json({
      generalResponses: response.generalResponses,
      studentResponses,
    });
  } catch (error) {
    console.error("Error fetching responses:", error.message);
    res.status(500).json({ message: "Failed to fetch responses." });
  }
},

  // Fetch the last response for a specific form, evaluator, and project
  getLastResponse: async (req, res) => {
    const { formID } = req.params;
    const { evaluatorID, projectCode } = req.query;
  
    if (!formID || !evaluatorID || !projectCode) {
      return res.status(400).json({ message: "Form ID, Evaluator ID, and Project Code are required." });
    }
  
    try {
      console.log("Received params:", { formID, evaluatorID, projectCode }); // Log inputs
  
      const responsesSnapshot = await db
        .collection("forms")
        .doc(formID)
        .collection("responses")
        .where("evaluatorID", "==", evaluatorID)
        .where("projectCode", "==", projectCode)
        //.orderBy("created_at", "desc")
        .limit(1)
        .get();
  
      console.log("Query result:", responsesSnapshot.docs); // Log query result
  
      if (responsesSnapshot.empty) {
        return res.status(404).json({ message: "No responses found for the given parameters." });
      }
  
      const lastResponse = responsesSnapshot.docs[0].data();
      console.log("Last response data:", lastResponse); // Log fetched data
  
      res.status(200).json(lastResponse);
    } catch (error) {
      console.error("Error in getLastResponse:", error); // Log error details
      res.status(500).json({ message: "Failed to fetch the last response." });
    }
  },
  
  

  // updateResponse: async (req, res) => {
  //   const { formID, responseId } = req.params;
  //   const updatedData = req.body;

  //   if (!formID || !responseId || !updatedData) {
  //     return res.status(400).json({ message: "Form ID, response ID, and updated data are required." });
  //   }

  //   try {
  //     await db
  //       .collection("forms")
  //       .doc(formID)
  //       .collection("responses")
  //       .where("evaluatorID", "==", evaluatorID)
  //       .where("projectCode", "==", projectCode)
  //       .update(updatedData);
  //     res.status(200).json({ message: "Response updated successfully." });
  //   } catch (error) {
  //     console.error("Error updating response:", error.message);
  //     res.status(500).json({ message: "Failed to update response." });
  //   }
  // },

  // Delete a specific response from a form
  deleteResponse: async (req, res) => {
    const { formID, responseId } = req.params;

    if (!formID || !responseId) {
      return res.status(400).json({ message: "Form ID and Response ID are required." });
    }

    try {
      await db.collection("forms").doc(formID).collection("responses").doc(responseId).delete();
      res.status(200).json({ message: "Response deleted successfully." });
    } catch (error) {
      console.error("Error deleting response:", error.message);
      res.status(500).json({ message: "Failed to delete response." });
    }
  },


  /* -------------------------form's evaluations (evaluations subCollection) --------------------------*/

  // Add a new evaluation
  addEvaluation: async (req, res) => {
    const { formID } = req.params;
    const { evaluatorID, projectCode, studentID, weightedGrade, comments } = req.body;

    if (!formID || !evaluatorID || !projectCode || !studentID || !weightedGrade) {
      return res.status(400).json({
        message: "formID, evaluatorID, projectCode, studentID, and weightedGrade are required.",
      });
    }

    try {
      const evaluationData = {
        evaluatorID,
        projectCode,
        studentID,
        weightedGrade,
      };

      await db.collection("forms").doc(formID).collection("evaluations").add(evaluationData);

      res.status(201).json({ message: "Evaluation added successfully." });
    } catch (error) {
      console.error("Error adding evaluation:", error.message);
      res.status(500).json({ message: "Failed to add evaluation." });
    }
  },

  // Fetch form evaluations
  getEvaluations: async (req, res) => {
    const { formID } = req.params;

    if (!formID) {
      return res.status(400).json({ message: "Form ID is required." });
    }

    try {
      const evaluationsSnapshot = await db.collection("forms").doc(formID).collection("evaluations").get();
      const evaluations = evaluationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(evaluations);
    } catch (error) {
      console.error("Error fetching evaluations:", error.message);
      res.status(500).json({ message: "Failed to fetch evaluations." });
    }
  },


  // Fetch all evaluations for a specific evaluator
  getEvaluationsByEvaluator: async (req, res) => {
    const { evaluatorID } = req.query;

    if (!evaluatorID) {
      console.error("Evaluator ID is missing in the request.");
      return res.status(400).json({ message: "Evaluator ID is required." });
    }

    try {
      console.log("Fetching evaluations for evaluatorID:", evaluatorID);
      const formsSnapshot = await db.collection("forms").get();

      if (formsSnapshot.empty) {
        console.log("No forms found.");
        return res.status(200).json([]); // Return an empty array if no forms exist
      }

      const evaluations = [];
      for (const formDoc of formsSnapshot.docs) {
        const evaluationsSnapshot = await db
          .collection("forms")
          .doc(formDoc.id)
          .collection("evaluations")
          .where("evaluatorID", "==", evaluatorID)
          .get();

        if (!evaluationsSnapshot.empty) {
          evaluationsSnapshot.forEach((doc) => {
            evaluations.push({
              formID: formDoc.id,
              ...doc.data(),
              id: doc.id,
            });
          });
        } else {
          console.log(`No evaluations for form: ${formDoc.id} and evaluatorID: ${evaluatorID}`);
        }
      }

      res.status(200).json(evaluations); // Respond with collected evaluations or an empty array
    } catch (error) {
      console.error("Error fetching evaluations:", error.message);
      res.status(500).json({ message: "Failed to fetch evaluations." });
    }
  },


  // Update a specific evaluation in a form
  updateEvaluation: async (req, res) => {
    const { formID, evaluationId } = req.params;
    const updatedData = req.body;

    if (!formID || !evaluationId || !updatedData) {
      return res.status(400).json({ message: "Form ID, evaluation ID, and updated data are required." });
    }

    try {
      await db.collection("forms").doc(formID).collection("evaluations").doc(evaluationId).update(updatedData);
      res.status(200).json({ message: "Evaluation updated successfully." });
    } catch (error) {
      console.error("Error updating evaluation:", error.message);
      res.status(500).json({ message: "Failed to update evaluation." });
    }
  },

  // Delete a specific evaluation from a form
  deleteEvaluation: async (req, res) => {
    const { formID, evaluationId } = req.params;

    if (!formID || !evaluationId) {
      return res.status(400).json({ message: "Form ID and evaluation ID are required." });
    }

    try {
      await db.collection("forms").doc(formID).collection("evaluations").doc(evaluationId).delete();
      res.status(200).json({ message: "Evaluation deleted successfully." });
    } catch (error) {
      console.error("Error deleting evaluation:", error.message);
      res.status(500).json({ message: "Failed to delete evaluation." });
    }
  },
};
