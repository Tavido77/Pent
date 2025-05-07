// Import Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById('counselorLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // TODO: Verify if the user is a counselor in your database
    window.location.href = '/counselor-dashboard.html';
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

document.querySelector('.google-login').addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // TODO: Verify if the Google account is registered as a counselor
    window.location.href = '/counselor-dashboard.html';
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
