const db = require("../config/firebaseAdmin");

const addDocument = async (collection, docId, data) => {
  try {
    await db.collection(collection).doc(docId).set(data);
    return { success: true };
  } catch (error) {
    console.error("Error adding document:", error.message);
    return { success: false, error: error.message };
  }
};

const getDocument = async (collection, docId) => {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    if (!doc.exists) return { success: false, message: "Document not found" };
    return { success: true, data: doc.data() };
  } catch (error) {
    console.error("Error fetching document:", error.message);
    return { success: false, error: error.message };
  }
};
const addSubcollection = async (parentCollection, docId, subcollectionName, subDocId, data) => {
  try {
    await db.collection(parentCollection).doc(docId).collection(subcollectionName).doc(subDocId).set(data);
    return { success: true };
  } catch (error) {
    console.error("Error adding subcollection:", error.message);
    return { success: false, error: error.message };
  }
};


const getSubcollection = async (collection, docId, subcollection) => {
  try {
    const doc = await db.collection(collection).doc(docId).collection(subcollection).doc("details").get();
    if (!doc.exists) return { success: false, message: "Subcollection not found" };
    return { success: true, data: doc.data() };
  } catch (error) {
    console.error("Error fetching subcollection:", error.message);
    return { success: false, error: error.message };
  }
};

const addProject = async (projectCode, data) => {
  try {
    await db.collection("projects").doc(projectCode).set(data);
    return { success: true };
  } catch (error) {
    console.error("Error adding project:", error.message);
    return { success: false, error: error.message };
  }
};

const getProject = async (projectCode) => {
  try {
    const doc = await db.collection("projects").doc(projectCode).get();
    if (!doc.exists) return { success: false, message: "Project not found" };
    return { success: true, data: doc.data() };
  } catch (error) {
    console.error("Error fetching project:", error.message);
    return { success: false, error: error.message };
  }
};

const getAllProjects = async () => {
  try {
    const snapshot = await db.collection("projects").get();
    const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: projects };
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    return { success: false, error: error.message };
  }
};

const updateProject = async (projectCode, data) => {
  try {
    await db.collection("projects").doc(projectCode).update(data);
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error.message);
    return { success: false, error: error.message };
  }
};

const deleteProject = async (projectCode) => {
  try {
    await db.collection("projects").doc(projectCode).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  addDocument,
  getDocument,
  addSubcollection,
  getSubcollection,
  addProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
};

