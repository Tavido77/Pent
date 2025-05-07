// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyB7U7EaZyISnP7LndvBtPsqm92h6lq0DgI",
  authDomain: "decide-be3b8.firebaseapp.com",
  projectId: "decide-be3b8",
  storageBucket: "decide-be3b8.firebasestorage.app",
  messagingSenderId: "13906129993",
  appId: "1:13906129993:web:5835d79445cd1eeb77fb98",
  measurementId: "G-EHGWEP0BCD"
};

// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
