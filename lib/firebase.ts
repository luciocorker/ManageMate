import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCg0rxvAdl74O9rB9XzONn49yS1ZEbPZpQ",
  authDomain: "managemate-32f1d.firebaseapp.com",
  projectId: "managemate-32f1d",
  storageBucket: "managemate-32f1d.firebasestorage.app",
  messagingSenderId: "764600575982",
  appId: "1:764600575982:web:2fe1ec2dab4d952b1a10ff",
  measurementId: "G-RE1FCTDP1N",
};

// Initialize Firebase only if not already initialized
let app;
let auth;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { app, auth };
