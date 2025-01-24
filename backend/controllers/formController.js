const db = require("../config/firebaseAdmin"); // Firebase admin setup

module.exports = {
  /* -------------------------forms--------------------------*/

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

  // Delete a form along with its subcollections
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
  const questionData = req.body;

  if (!formID || !questionData) {
    return res.status(400).json({ message: "Form ID and question data are required." });
  }

  try {
    const newQuestion = await db
      .collection("forms")
      .doc(formID)
      .collection("questions")
      .add(questionData);

    res.status(201).json({
      message: "Question added successfully.",
      id: newQuestion.id,
      questionData,
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


      console.log("Updating finalGrades...");

      const finalGradesSnapshot = await db
        .collection("finalGrades")
        .where("projectCode", "==", projectCode)
        .get();

      if (!finalGradesSnapshot.empty) {
        finalGradesSnapshot.forEach(async (doc) => {
          const finalGradeDoc = doc.data();
          const studentID = finalGradeDoc.studentID;

          console.log(`Processing final grades for studentID: ${studentID}`);

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

          evaluatorsSnapshot.forEach(async (evaluatorDoc) => {
            const evaluator = evaluatorDoc.data();

            if (evaluator.status === "Submitted") {
              const evaluationSnapshot = await db
                .collection("forms")
                .doc(evaluator.formID)
                .collection("evaluations")
                .where("evaluatorID", "==", evaluator.evaluatorID)
                .where("projectCode", "==", projectCode)
                .get();

              evaluationSnapshot.forEach((evaluationDoc) => {
                const evaluation = evaluationDoc.data();
                const grades = evaluation.grades || {};

                if (grades[studentID] !== undefined) {
                  switch (evaluator.formID) {
                    case "SupervisorForm":
                      totalSupervisorGrade += grades[studentID];
                      supervisorCount++;
                      break;
                    case "PresentationForm":
                      totalPresentationGrade += grades[studentID];
                      presentationCount++;
                      break;
                    case "BookForm":
                      totalBookGrade += grades[studentID];
                      bookCount++;
                      break;
                    default:
                      console.log(`Unknown formID: ${evaluator.formID}`);
                  }
                }
              });
            }
          });

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
            CalculatedSupervisorGrade: calculatedSupervisorGrade,
            CalculatedPresentationGrade: calculatedPresentationGrade,
            CalculatedBookGrade: calculatedBookGrade,
            finalGrade,
            status,
            updated_at: new Date().toISOString(),
          });

          console.log(`Updated final grade for student ${studentID}:`, {
            finalGrade,
            status,
          });
        });
      } else {
        console.log("No matching finalGrades document found for the project and student.");
      }

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
    console.log("params in controller GET_LAST_RESPONSE:", { evaluatorID, projectCode,formID });
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

};
