/**
 * This module provides helper functions for interacting with Firestore.
 * It includes the following functionalities:
 * 
 * 1. Add a document:
 *    - Adds a new document to a specified collection.
 * 
 * 2. Get a document:
 *    - Retrieves a document from a specified collection using its document ID.
 * 
 * 3. Add a subcollection:
 *    - Adds a new document to a subcollection of a specified document.
 * 
 * 4. Get a subcollection:
 *    - Retrieves a document from a subcollection of a specified document.
 * 
 * The module uses Firebase Admin SDK to interact with Firestore.
 */
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


module.exports = {
  addDocument,
  getDocument,
  addSubcollection,
  getSubcollection,
};
