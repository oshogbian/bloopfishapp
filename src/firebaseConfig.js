// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";  // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDGkxTlzN6H3dmvDFeKvLs2d4gCXKQl0k",
  authDomain: "bloop-farm-tracker.firebaseapp.com",
  projectId: "bloop-farm-tracker",
  storageBucket: "bloop-farm-tracker.firebasestorage.app",
  messagingSenderId: "385084835909",
  appId: "1:385084835909:web:e285e33c78194a1de3fb2c",
  measurementId: "G-E68WVVK7CR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics
//const analytics = getAnalytics(app);

// Export the db object for use in other files
export { db };
