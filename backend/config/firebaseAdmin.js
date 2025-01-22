const admin = require("firebase-admin");
require("dotenv").config();

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        projectId: process.env.FIREBASE_PROJECT_ID,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
} catch (error) {
  console.error('Firebase admin initialization error:', error.stack);
}

const db = admin.firestore();
module.exports = db;