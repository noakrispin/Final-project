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

module.exports = { addDocument, getDocument };
