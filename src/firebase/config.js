// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA6y-M3TW39_YMVY_37nBbFEIZB8rQ3dG4",
  authDomain: "mcling-f256c.firebaseapp.com",
  projectId: "mcling-f256c",
  storageBucket: "mcling-f256c.firebasestorage.app",
  messagingSenderId: "974403247613",
  appId: "1:974403247613:web:450d9c348d809d09070d94",
  measurementId: "G-QGD5HBM2CL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
