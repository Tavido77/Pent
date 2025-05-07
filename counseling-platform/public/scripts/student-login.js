// Import Firebase modules
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { app } from './firebase-config.js';

console.log('Setting up authentication...');
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

console.log('Auth service initialized');

// Email/Password Login
// Check if already logged in
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user');
    if (user) {
        console.log('Redirecting to dashboard...');
        window.location.href = 'student-dashboard.html';
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitButton = document.querySelector('.login-submit');
  
  try {
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    
    console.log('Attempting login with email...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Login successful:', user.email);
    
    // TODO: Check if user is a student in your database
    // For now, we'll redirect to student dashboard
    console.log('Redirecting to dashboard...');
    window.location.href = 'student-dashboard.html';
  } catch (error) {
    console.error('Login error:', error);
    alert(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Log In';
  }
});

// Google Login
document.querySelector('.google-login').addEventListener('click', async function() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // TODO: Check if Google user is a student in your database
    // For now, we'll redirect to student dashboard
    window.location.href = 'student-dashboard.html';
  } catch (error) {
    console.error('Google login error:', error);
    alert(error.message);
  }
});

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, redirect to dashboard
    window.location.href = 'student-dashboard.html';
  }
});
