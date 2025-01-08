import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUs3tyJjm6dt4AMPIO76qwE5n9_uy7ggI",
  authDomain: "projecthub-88fb1.firebaseapp.com",
  projectId: "projecthub-88fb1",
  storageBucket: "projecthub-88fb1.firebasestorage.app",
  messagingSenderId: "502302150475",
  appId: "1:502302150475:web:980c77f992bb50af2e62ce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
