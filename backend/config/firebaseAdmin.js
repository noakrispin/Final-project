const admin = require("firebase-admin");
require("dotenv").config();

let db = null;

try {
  // Log environment check
  console.log('Checking Firebase environment variables...');
  
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
  }

  // Log initialization attempt
  console.log('Initializing Firebase...');

  if (!admin.apps.length) {
    const credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Ensure proper private key formatting
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    // Log credential check (without exposing sensitive data)
    console.log('Firebase credentials check:', {
      hasProjectId: !!credentials.projectId,
      hasClientEmail: !!credentials.clientEmail,
      hasPrivateKey: !!credentials.privateKey,
    });

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase app already initialized');
  }

  db = admin.firestore();
  
  // Verify database connection
  if (db) {
    console.log('Firestore connection established');
  } else {
    throw new Error('Failed to initialize Firestore');
  }

} catch (error) {
  console.error('Firebase initialization error:', error.message);
  console.error('Error stack:', error.stack);
  
  // Log environment status (without exposing sensitive data)
  console.error('Environment status:', {
    NODE_ENV: process.env.NODE_ENV,
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasDatabaseUrl: !!process.env.FIREBASE_DATABASE_URL
  });
}

module.exports = db;