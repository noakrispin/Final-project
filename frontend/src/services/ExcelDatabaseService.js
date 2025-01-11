import { db } from '../firebaseConfig';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

export const ExcelDatabaseService = {
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

  getProjects: async () => {
    const snapshot = await getDocs(collection(db, "projects"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  getUploadedProjects: async () => {
    const snapshot = await getDocs(collection(db, "projects"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  clearUploadedProjects: async () => {
    // Optional: Implement if needed
  },
};
