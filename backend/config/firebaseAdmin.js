const admin = require("firebase-admin");
require("dotenv").config();

let db = null;

try {
  // Check if we have all required Firebase credentials
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingEnvVars.join(', ')}`);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Make sure to properly parse the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }

  db = admin.firestore();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Log specific details about the environment
  console.error('Environment:', {
    projectId: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set',
    databaseURL: process.env.FIREBASE_DATABASE_URL ? 'Set' : 'Not set'
  });
}

module.exports = db;