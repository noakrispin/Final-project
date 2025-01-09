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
const addSubcollection = async (collection, docId, subcollection, data) => {
  try {
    await db.collection(collection).doc(docId).collection(subcollection).doc("details").set(data);
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

module.exports = { addDocument, getDocument, addSubcollection, getSubcollection};
