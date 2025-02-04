/**
 * This module provides controller functions for managing forms and their subcollections in a Firestore database.
 * It includes the following functionalities:
 * 
 * 1. Create a new form:
 *    - Creates a new form with subcollections.
 * 
 * 2. Update a specific form:
 *    - Updates the metadata and questions of a specific form.
 * 
 * 3. Fetch a specific form:
 *    - Retrieves the details of a specific form using its unique document ID.
 * 
 * 4. Get all forms:
 *    - Fetches all form records from the Firestore database.
 * 
 * 5. Delete a form:
 *    - Deletes a form along with its subcollections.
 * 
 * 6. Fetch questions for a specific form:
 *    - Retrieves all questions for a specific form.
 * 
 * 7. Add a new question to a form:
 *    - Adds a new question to a specific form.
 * 
 * 8. Update a specific question in a form:
 *    - Updates the details of a specific question in a form.
 * 
 * 9. Delete a specific question from a form:
 *    - Deletes a specific question from a form.
 * 
 * 10. Submit form data:
 *    - Submits form data including general and student-specific responses, and calculates weighted grades.
 * 
 * 11. Fetch the last response for a specific form, evaluator, and project:
 *    - Retrieves the last response for a specific form, evaluator, and project.
 * 
 * 12. Fetch all responses for a specific form:
 *    - Retrieves all responses for a specific form.
 * 
 * 13. Fetch form evaluations:
 *    - Retrieves all evaluations for a specific form.
 * 
 * 14. Fetch all evaluations for a specific evaluator:
 *    - Retrieves all evaluations for a specific evaluator.
 * 
 * 15. Fetch evaluations by evaluatorID and projectCode:
 *    - Retrieves evaluations for a specific evaluator and project.
 * 
 * The module uses Firebase Admin SDK to interact with Firestore.
 */
const db = require("../config/firebaseAdmin"); // Firebase admin setup

module.exports = {
  // Create a new form with subcollections
  // createForm: async (req, res) => {
  //   const { formID, description, formName } = req.body;

  //   if (!formID || !formName) {
  //     return res.status(400).json({ message: "Form ID and Form Name are required." });
  //   }

  //   try {
  //     await db.collection("forms").doc(formID).set({
  //       description: description || "",
  //       formName,
  //       created_at: new Date().toISOString(),
  //     });

  //     res.status(201).json({ message: "Form created successfully." });
  //   } catch (error) {
  //     console.error("Error creating form:", error.message);
  //     res.status(500).json({ message: "Failed to create form." });
  //   }
  // },

  // Update a specific form
  updateForm: async (req, res) => {
    const { formID } = req.params;
    const updatedData = req.body;

    if (!formID || !updatedData) {
        return res.status(400).json({ message: "Form ID and updated data are required." });
    }

    try {
        const formRef = db.collection("forms").doc(formID);

        // Extract form metadata and questions separately
        const { formName, description, questions } = updatedData;

        // Step 1: Update form metadata (if provided)
        if (formName || description) {
            await formRef.update({
                ...(formName && { formName }), // Only update if provided
                ...(description && { description })
            });
        }

        // Step 2: Update the questions inside the subcollection (if provided)
        if (questions && Array.isArray(questions)) {
            const batch = db.batch();

            questions.forEach((question) => {
                const questionRef = formRef.collection("questions").doc(question.id);
                batch.set(questionRef, question, { merge: true }); // Merge ensures existing fields aren't deleted
            });

            await batch.commit();
        }

        res.status(200).json({ message: "Form and questions updated successfully." });
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

  getAllForms: async (req, res) => {
    try {
      console.log("Fetching all forms...");

      // Fetch all documents in the "forms" collection
      const formsSnapshot = await db.collection("forms").get();

      // If the collection is empty, return an empty array
      if (formsSnapshot.empty) {
        console.log("No forms found in the database.");
        return res.status(200).json([]);
      }

      // Map through the documents to extract their data
      const forms = formsSnapshot.docs.map((doc) => ({
        formID: doc.id, // Include the document ID
        ...doc.data(), // Include the form's fields
      }));

      console.log("Fetched forms:", forms);
      res.status(200).json(forms);
    } catch (error) {
      console.error("Error fetching forms:", error.message);
      res.status(500).json({ message: "Failed to fetch forms." });
    }
  },

  // Delete a form along with its subcollections -- can use in future development of the system..
  // deleteForm: async (req, res) => {
  //   const { formID } = req.params;

  //   if (!formID) {
  //     return res.status(400).json({ message: "Form ID is required." });
  //   }

  //   try {
  //     const formRef = db.collection("forms").doc(formID);

  //     // Function to delete all documents in a subcollection
  //     const deleteSubcollection = async (subcollection) => {
  //       const snapshot = await formRef.collection(subcollection).get();
  //       const batch = db.batch();
  //       snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  //       await batch.commit();
  //     };

  //     // Delete subcollections
  //     await Promise.all([
  //       deleteSubcollection("questions"),
  //       deleteSubcollection("responses"),
  //       deleteSubcollection("evaluations"),
  //     ]);

  //     // Delete the form document
  //     await formRef.delete();

  //     res.status(200).json({ message: "Form and its subcollections deleted successfully." });
  //   } catch (error) {
  //     console.error("Error deleting form:", error.message);
  //     res.status(500).json({ message: "Failed to delete form." });
  //   }
  // },

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
    const questionData = req.body; // Get the question data from the request body

    if (!formID || !questionData) {
      return res.status(400).json({ message: "Form ID and question data are required." });
    }

    try {
      console.log("Adding question to form:", { formID, questionData });

      // Use questionID as the Firestore document ID
      const questionRef = db
        .collection("forms")
        .doc(formID)
        .collection("questions")
        .doc(questionData.questionID);

      // Save the entire questionData object, ensuring all fields are included
      await questionRef.set({
        id: questionData.questionID, // Explicitly set `id` to match `questionID`
        title: questionData.title || "New Question", // Use default if missing
        description: questionData.description || "", // Default to an empty string if not provided
        order: questionData.order || 0,
        reference: questionData.reference || "general",
        required: questionData.required || false,
        response_type: questionData.response_type || "text",
        weight: questionData.weight || 0,
      });

      console.log("Question successfully added:", questionData);

      res.status(201).json({
        message: "Question added successfully.",
        questionData: {
          ...questionData,
          id: questionData.questionID,
        },
      });
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
      return res
        .status(400)
        .json({ message: "Form ID, question ID, and updated data are required." });
    }

    try {
      await db
        .collection("forms")
        .doc(formID)
        .collection("questions")
        .doc(questionId)
        .update(updatedData);

      res.status(200).json({
        message: "Question updated successfully.",
        updatedData,
      });
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
      await db
        .collection("forms")
        .doc(formID)
        .collection("questions")
        .doc(questionId)
        .delete();

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

    console.log("Submitting form data:", { evaluatorID, projectCode, general, students });

    if (!formID || !evaluatorID || !projectCode || !general || !students) {
      console.log("Missing required fields:", { formID, evaluatorID, projectCode, general, students });
      return res.status(400).json({
        message: "Form ID, evaluator ID, project code, general responses, and student responses are required.",
      });
    }

    try {
      console.log("Fetching questions and weights for form:", formID);

      // Fetch question weights from the `questions` subcollection
      const questionsSnapshot = await db
        .collection("forms")
        .doc(formID)
        .collection("questions")
        .get();

      const questionWeights = {};
      questionsSnapshot.docs.forEach((doc) => {
        const { questionID, weight, response_type } = doc.data();
        if (weight && typeof weight === "number" && response_type === "number") {
          questionWeights[questionID] = weight;
        }
      });

      console.log("Fetched Question Weights:", questionWeights);

      // Save or update responses
      const existingResponsesSnapshot = await db
        .collection("forms")
        .doc(formID)
        .collection("responses")
        .where("evaluatorID", "==", evaluatorID)
        .where("projectCode", "==", projectCode)
        .get();

      let responseRef;
      if (!existingResponsesSnapshot.empty) {
        console.log("Updating existing response...");
        responseRef = existingResponsesSnapshot.docs[0].ref;
        await responseRef.update({
          general,
          students,
          updated_at: new Date().toISOString(),
        });
      } else {
        console.log("Creating new response...");
        responseRef = await db.collection("forms").doc(formID).collection("responses").add({
          evaluatorID,
          projectCode,
          general,
          students,
          created_at: new Date().toISOString(),
        });
      }

      console.log("Responses saved successfully.");

      // Function to calculate weighted grades
      const calculateGrades = (generalResponses, studentResponses, weights) => {
        console.log("Calculating grades...");

        // Calculate the weighted grade for general responses
        const calculateGeneralGrade = (responses) => {
          let totalWeightedSum = 0;
          let totalWeight = 0;

          Object.entries(responses).forEach(([questionID, score]) => {
            if (typeof score === "number" && weights[questionID]) {
              console.log(
                `Processing General Question: ${questionID}, Score: ${score}, Weight: ${weights[questionID]}`
              );
              totalWeightedSum += score * weights[questionID];
              totalWeight += weights[questionID];
            } else {
              console.log(
                `Skipping General Question: ${questionID} (Score: ${score}, Weight: ${weights[questionID] || "Not Found"})`
              );
            }
          });

          console.log("Total General Weighted Sum:", totalWeightedSum, "Total Weight:", totalWeight);
          return totalWeight > 0 ? totalWeightedSum : 0;
        };

        const generalGrade = calculateGeneralGrade(generalResponses);

        // Calculate each student's total weighted grade
        const studentGrades = {};
        for (const [studentID, studentSpecificResponses] of Object.entries(studentResponses)) {
          let studentWeightedSum = 0;
          let studentWeight = 0;

          Object.entries(studentSpecificResponses).forEach(([questionID, score]) => {
            if (typeof score === "number" && weights[questionID]) {
              console.log(
                `Processing Student-Specific Question: ${questionID}, Score: ${score}, Weight: ${weights[questionID]}`
              );
              studentWeightedSum += score * weights[questionID];
              studentWeight += weights[questionID];
            } else {
              console.log(
                `Skipping Student-Specific Question: ${questionID} (Score: ${score}, Weight: ${weights[questionID] || "Not Found"})`
              );
            }
          });

          console.log(
            `Student-Specific Weighted Sum: ${studentWeightedSum}, Student Weight: ${studentWeight}`
          );
          const studentGrade = Number((generalGrade + studentWeightedSum).toFixed(0));
          console.log(
            `Grade for Student ID(to this Form): ${studentID} = General Grade (${generalGrade}) + Student-Specific Grade (${studentWeightedSum})`
          );
          studentGrades[studentID] = studentGrade;
        }

        return studentGrades;
      };

      // Calculate weighted grades for each student
      const weightedGrades = calculateGrades(general, students, questionWeights);
      console.log("Calculated Weighted Grades:", weightedGrades);

      // Check for existing evaluation
      const existingEvaluationSnapshot = await db
        .collection("forms")
        .doc(formID)
        .collection("evaluations")
        .where("evaluatorID", "==", evaluatorID)
        .where("projectCode", "==", projectCode)
        .get();

      if (!existingEvaluationSnapshot.empty) {
        console.log("Updating existing evaluation...");
        const evaluationRef = existingEvaluationSnapshot.docs[0].ref;
        await evaluationRef.update({
          grades: weightedGrades, // Update the grades map
          updated_at: new Date().toISOString(),
        });
      } else {
        console.log("Creating new evaluation...");
        const evaluationData = {
          evaluatorID,
          projectCode,
          grades: weightedGrades, // Save as a map of studentID to their grade
          created_at: new Date().toISOString(),
        };
        await db.collection("forms").doc(formID).collection("evaluations").add(evaluationData);
      }

      console.log("Evaluation saved successfully.");

      res.status(200).json({
        message: "Form submitted successfully with calculated evaluations&final grades.",
      });
    } catch (error) {
      console.error("Error submitting form:", error.message, error.stack);
      res.status(500).json({ message: "Failed to submit form." });
    }
  },


  // Fetch the last response for a specific form, evaluator, and project
  getLastResponse: async (req, res) => {
    const { formID } = req.params;
    const { evaluatorID, projectCode } = req.query;
    console.log("params in controller GET_LAST_RESPONSE:", { evaluatorID, projectCode, formID });
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


  getResponses: async (req, res) => {
    const { formID } = req.params;

    if (!formID) {
      return res.status(400).json({ message: "Form ID is required." });
    }

    try {
      console.log("Fetching responses for formID:", formID);

      const responsesSnapshot = await db
        .collection("forms")
        .doc(formID)
        .collection("responses")
        .get();

      if (responsesSnapshot.empty) {
        console.warn(`No responses found for formID: ${formID}`);
        return res.status(404).json({
          error: {
            message: "No responses found for the specified form.",
            status: 404,
          },
        });
      }

      const responses = responsesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`Fetched ${responses.length} responses for formID: ${formID}`);
      res.status(200).json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error.message);
      res.status(500).json({ message: "Failed to fetch responses." });
    }
  },



  /* -------------------------form's evaluations (evaluations subCollection) --------------------------*/


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
        console.log(`Fetching evaluations for form: ${formDoc.id}`);
        const evaluationsSnapshot = await db
          .collection("forms")
          .doc(formDoc.id)
          .collection("evaluations")
          .where("evaluatorID", "==", evaluatorID)
          .get();

        console.log(
          `Query for form ${formDoc.id} returned ${evaluationsSnapshot.size} evaluations.`
        );


        if (!evaluationsSnapshot.empty) {
          evaluationsSnapshot.forEach((doc) => {
            console.log(`Evaluation for form ${formDoc.id}:`, doc.data());
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

      console.log("Collected Evaluations:", evaluations);
      res.status(200).json(evaluations); // Respond with collected evaluations or an empty array
    } catch (error) {
      console.error("Error fetching evaluations:", error.message);
      res.status(500).json({ message: "Failed to fetch evaluations." });
    }
  },

  // Fetch evaluations by evaluatorID and projectCode
  getEvaluationByEvaluatorAndProject: async (req, res) => {
    const { evaluatorID, projectCode } = req.query;
    console.log("Received params in getEvaluationByEvaluatorAndProject:", { evaluatorID, projectCode });
  
    if (!evaluatorID || !projectCode) {
      return res.status(400).json({
        message: "Evaluator ID and Project Code are required.",
      });
    }
  
    try {
      console.log("Fetching evaluations for:", { evaluatorID, projectCode });
  
      // Fetch all forms to find the matching evaluation
      const formsSnapshot = await db.collection("forms").get();
  
      if (formsSnapshot.empty) {
        return res.status(404).json({
          message: "No forms found in the database.",
        });
      }
  
      // Iterate through forms to find the evaluation
      for (const formDoc of formsSnapshot.docs) {
        const evaluationsSnapshot = await db
          .collection("forms")
          .doc(formDoc.id)
          .collection("evaluations")
          .where("evaluatorID", "==", evaluatorID)
          .where("projectCode", "==", projectCode)
          .limit(1) // Limit to only one document
          .get();
  
        if (!evaluationsSnapshot.empty) {
          const evaluationDoc = evaluationsSnapshot.docs[0];
          const evaluation = {
            formID: formDoc.id,
            evaluationID: evaluationDoc.id,
            ...evaluationDoc.data(),
          };
  
          return res.status(200).json(evaluation); // Return the first matching evaluation
        }
      }
  
      return res.status(404).json({
        message: "No evaluation found for the given evaluator and project.",
      });
    } catch (error) {
      console.error("Error fetching evaluation:", error);
      res.status(500).json({ message: "Failed to fetch evaluation." });
    }
  },
  

  

};
