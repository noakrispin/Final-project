const admin = require("firebase-admin");
require("dotenv").config();

let app;

try {
  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Make sure to properly parse the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    app = admin.app();
  }
} catch (error) {
  console.error('Firebase admin initialization error:', error);
}

const db = app ? app.firestore() : null;
if (!db) {
  console.error('Firestore initialization failed');
}

module.exports = db;