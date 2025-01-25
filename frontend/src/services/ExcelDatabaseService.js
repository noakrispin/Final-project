import { db } from '../firebaseConfig';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

export const ExcelDatabaseService = {

  //functions for projects Upload files

  //insert new projects to projects collection from excel file
  insertProjects: async (projects) => {
    try {
      const batch = writeBatch(db);
      projects.forEach((project) => {
        // Use projectCode as the document ID
        const projectRef = doc(db, "projects", project.projectCode);
        batch.set(projectRef, project);
      });
      await batch.commit();
      console.log("Projects successfully inserted:", projects);
      return projects; // Return inserted projects
    } catch (error) {
      console.error("Error inserting projects:", error.message, {
        projects,
        errorDetails: error,
      });
      throw new Error("Database error: " + error.message);
    }
  },

//insert new projects' Supervisors as evaluators of SupervisorForm to evaluators collection from excel file
insertSupervisorsEvaluators: async (projects) => {
  try {
    // Fetch all existing evaluators and map by unique combination of evaluatorID, projectCode, and formID
    const evaluatorsSnapshot = await getDocs(collection(db, "evaluators"));
    const existingEvaluatorsSet = new Set(
      evaluatorsSnapshot.docs.map((doc) =>
        JSON.stringify({
          evaluatorID: doc.data().evaluatorID,
          projectCode: doc.data().projectCode,
          formID: doc.data().formID,
        })
      )
    );

    const batch = writeBatch(db);

    projects.forEach((project) => {
      if (project.supervisor1) {
        const evaluatorRecord1 = {
          evaluatorID: project.supervisor1,
          projectCode: project.projectCode,
          formID: "SupervisorForm",
        };

        if (!existingEvaluatorsSet.has(JSON.stringify(evaluatorRecord1))) {
          const evaluatorRef1 = doc(collection(db, "evaluators"));
          batch.set(evaluatorRef1, {
            ...evaluatorRecord1,
            status: "Not Submitted",
          });
        }
      }

      if (project.supervisor2) {
        const evaluatorRecord2 = {
          evaluatorID: project.supervisor2,
          projectCode: project.projectCode,
          formID: "SupervisorForm",
        };

        if (!existingEvaluatorsSet.has(JSON.stringify(evaluatorRecord2))) {
          const evaluatorRef2 = doc(collection(db, "evaluators"));
          batch.set(evaluatorRef2, {
            ...evaluatorRecord2,
            status: "Not Submitted",
          });
        }
      }
    });

    await batch.commit();
    console.log("Evaluators successfully inserted (excluding duplicates).");
  } catch (error) {
    console.error("Error inserting evaluators:", error.message);
    throw new Error("Database error: " + error.message);
  }
},


  insertStudentsToFinalGrades: async (projects) => {
    try {
      // Fetch all existing finalGrades and map by unique combination of studentID, projectCode, and part
      const finalGradesSnapshot = await getDocs(collection(db, "finalGrades"));
      const existingFinalGradesSet = new Set(
        finalGradesSnapshot.docs.map((doc) =>
          JSON.stringify({
            studentID: doc.data().studentID,
            projectCode: doc.data().projectCode,
            part: doc.data().part,
          })
        )
      );
  
      const batch = writeBatch(db);
  
      projects.forEach((project) => {
        if (project.Student1 && project.Student1.ID) {
          const finalGradeRecord1 = {
            studentID: project.Student1.ID,
            projectCode: project.projectCode,
            part: project.part,
          };
  
          if (!existingFinalGradesSet.has(JSON.stringify(finalGradeRecord1))) {
            const finalGradeRef1 = doc(collection(db, "finalGrades"));
            batch.set(finalGradeRef1, {
              ...finalGradeRecord1,
              status: "Not graded", // Default status
              CalculatedBookGrade: null,
              CalculatedPresentationGrade: null,
              CalculatedSupervisorGrade: null,
              finalGrade: null,
            });
          }
        }
  
        if (project.Student2 && project.Student2.ID) {
          const finalGradeRecord2 = {
            studentID: project.Student2.ID,
            projectCode: project.projectCode,
            part: project.part,
          };
  
          if (!existingFinalGradesSet.has(JSON.stringify(finalGradeRecord2))) {
            const finalGradeRef2 = doc(collection(db, "finalGrades"));
            batch.set(finalGradeRef2, {
              ...finalGradeRecord2,
              status: "Not graded", // Default status
              CalculatedBookGrade: null,
              CalculatedPresentationGrade: null,
              CalculatedSupervisorGrade: null,
              finalGrade: null,
            });
          }
        }
      });
  
      await batch.commit();
      console.log("Students successfully added to finalGrades (excluding duplicates).");
    } catch (error) {
      console.error("Error adding students to finalGrades:", error.message);
      throw new Error("Database error: " + error.message);
    }
  },
  


  //functions for Evaluators Upload files
  //Inserting evaluators by evaluators excel file (for presentation and book evaluators)
  insertEvaluators: async (processedData) => {
    try {
      if (!Array.isArray(processedData) || processedData.length === 0) {
        throw new Error('No valid data found in the processed data.');
      }
  
      // Fetch all projects once and map them by projectCode
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const projectsMap = new Map(
        projectsSnapshot.docs.map((doc) => [doc.data().projectCode, doc.data()])
      );
  
      // Fetch all existing evaluators once and map by unique combination of fields
      const evaluatorsSnapshot = await getDocs(collection(db, 'evaluators'));
      const existingEvaluatorsSet = new Set(
        evaluatorsSnapshot.docs.map((doc) =>
          JSON.stringify({
            evaluatorID: doc.data().evaluatorID,
            formID: doc.data().formID,
            projectCode: doc.data().projectCode,
          })
        )
      );
  
      // Create a local Set to track unique evaluator records in the current batch
      const localEvaluatorSet = new Set();
  
      const batch = writeBatch(db);
      const failedRows = []; // Collect failed rows for debugging
  
      for (const [index, row] of processedData.entries()) {
        try {
          const { projectCode, presentationEvaluator, bookEvaluator } = row;
  
          if (!projectCode) {
            throw new Error(`Missing projectCode in row ${index + 1}`);
          }
  
          const project = projectsMap.get(projectCode);
          if (!project) {
            throw new Error(`Project with code ${projectCode} not found`);
          }
  
          const projectPart = project.part; // Get the part (A or B)
  
          // Add Presentation Evaluator
          if (presentationEvaluator) {
            const evaluatorRecord = {
              evaluatorID: presentationEvaluator,
              formID: `PresentationForm${projectPart}`,
              projectCode,
            };
  
            const evaluatorKey = JSON.stringify(evaluatorRecord);
  
            if (
              !existingEvaluatorsSet.has(evaluatorKey) &&
              !localEvaluatorSet.has(evaluatorKey)
            ) {
              const evaluatorRef = doc(collection(db, 'evaluators'));
              batch.set(evaluatorRef, {
                ...evaluatorRecord,
                status: 'Not Submitted',
              });
              localEvaluatorSet.add(evaluatorKey); // Add to local Set to prevent duplicates in the batch
            }
          }
  
          // Add Book Evaluator
          if (bookEvaluator) {
            const evaluatorRecord = {
              evaluatorID: bookEvaluator,
              formID: `bookReviewerForm${projectPart}`,
              projectCode,
            };
  
            const evaluatorKey = JSON.stringify(evaluatorRecord);
  
            if (
              !existingEvaluatorsSet.has(evaluatorKey) &&
              !localEvaluatorSet.has(evaluatorKey)
            ) {
              const evaluatorRef = doc(collection(db, 'evaluators'));
              batch.set(evaluatorRef, {
                ...evaluatorRecord,
                status: 'Not Submitted',
              });
              localEvaluatorSet.add(evaluatorKey); // Add to local Set to prevent duplicates in the batch
            }
          }
        } catch (error) {
          failedRows.push({ row: index + 1, error: error.message });
          console.error(`Error processing row ${index + 1}:`, error.message);
        }
      }
  
      await batch.commit();
  
      if (failedRows.length > 0) {
        console.warn(
          `${failedRows.length} rows failed to process. Details:`,
          failedRows
        );
      }
  
      console.log('Evaluators successfully inserted (excluding duplicates).');
    } catch (error) {
      console.error('Error inserting evaluators:', error.message);
      throw new Error('Database error: ' + error.message);
    }
  },
  
getProjects: async () => {
    const snapshot = await getDocs(collection(db, "projects"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // Optional: Fetch Uploaded Projects (if different logic is required)
  getUploadedProjects: async () => {
    const snapshot = await getDocs(collection(db, "projects"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // Optional: Clear Uploaded Projects (if needed)
  clearUploadedProjects: async () => {
    console.warn("clearUploadedProjects not implemented.");
  },
};
