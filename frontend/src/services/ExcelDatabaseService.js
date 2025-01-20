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
  insertEvaluators: async (file) => {
    try {
      const data = await readExcelFile(file);

      const batch = writeBatch(db);

      for (const row of data) {
        const { projectCode, presentationEvaluator, bookEvaluator } = row;

        // Fetch project to determine its part (A or B)
        const projectQuery = query(
          collection(db, 'projects'),
          where('projectCode', '==', projectCode)
        );
        const projectSnapshot = await getDocs(projectQuery);
        if (projectSnapshot.empty) {
          console.warn(`Project with code ${projectCode} not found.`);
          continue;
        }

        const project = projectSnapshot.docs[0].data();
        const projectPart = project.part; // Get the part (A or B)

        // Add Presentation Evaluator
        if (presentationEvaluator) {
          const evaluatorRef = doc(collection(db, 'evaluators'));
          batch.set(evaluatorRef, {
            evaluatorID: presentationEvaluator,
            formID: `PresentationForm${projectPart}`,
            projectCode,
            status: 'Not Submitted',
          });
        }

        // Add Book Evaluator
        if (bookEvaluator) {
          const evaluatorRef = doc(collection(db, 'evaluators'));
          batch.set(evaluatorRef, {
            evaluatorID: bookEvaluator,
            formID: `bookReviewerForm${projectPart}`,
            projectCode,
            status: 'Not Submitted',
          });
        }
      }

      await batch.commit();
      console.log('Evaluators successfully inserted.');
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
