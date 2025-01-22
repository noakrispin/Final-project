import { db } from '../firebaseConfig';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

export const ExcelDatabaseService = {
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
      const batch = writeBatch(db);
      projects.forEach((project) => {
        if (project.supervisor1) {
          const evaluatorRef1 = doc(collection(db, "evaluators"));
          batch.set(evaluatorRef1, {
            evaluatorID: project.supervisor1,
            formID: "SupervisorForm",
            projectCode: project.projectCode,
            status: "Not Submitted",
          });
        }

        if (project.supervisor2) {
          const evaluatorRef2 = doc(collection(db, "evaluators"));
          batch.set(evaluatorRef2, {
            evaluatorID: project.supervisor2,
            formID: "SupervisorForm",
            projectCode: project.projectCode,
            status: "Not Submitted",
          });
        }
      });
      await batch.commit();
      console.log("Evaluators successfully inserted.");
    } catch (error) {
      console.error("Error inserting evaluators:", error.message);
      throw new Error("Database error: " + error.message);
    }
  },


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

  getUploadedProjects: async () => {
    const snapshot = await getDocs(collection(db, "projects"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // clearUploadedProjects: async () => {
  //   // Optional: Implement if needed
  // },
};
