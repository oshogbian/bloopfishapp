// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCDGkxTlzN6H3dmvDFeKvLs2d4gCXKQl0k",
  authDomain: "bloop-farm-tracker.firebaseapp.com",
  projectId: "bloop-farm-tracker",
  storageBucket: "bloop-farm-tracker.firebasestorage.app",
  messagingSenderId: "385084835909",
  appId: "1:385084835909:web:e285e33c78194a1de3fb2c",
  measurementId: "G-E68WVVK7CR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);