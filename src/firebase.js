// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // For Firebase Authentication
import { getFirestore } from 'firebase/firestore'; // For Firestore Database


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZL28Y0Iipr7wsQA2E6R1eFV6xjgKIxPU",
  authDomain: "ivote-2fd0b.firebaseapp.com",
  databaseURL: "https://ivote-2fd0b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ivote-2fd0b",
  storageBucket: "ivote-2fd0b.firebasestorage.app",
  messagingSenderId: "1091981317033",
  appId: "1:1091981317033:web:2dd98daf3d6735f2fa2ab8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore Database

// Export the initialized services for use in your app
export { auth, db };
