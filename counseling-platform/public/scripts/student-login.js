// Import Firebase modules
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { app } from './firebase-config.js';
import { AuthUtils } from './auth-utils.js';

console.log('Setting up authentication...');
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

console.log('Auth service initialized');

// Check if already logged in
auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user');
    if (user) {
        try {
            await AuthUtils.verifyStudentRole(user);
            console.log('Student verified, redirecting to dashboard...');
            AuthUtils.showNotification('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 1000);
        } catch (error) {
            console.error('Role verification error:', error);
            AuthUtils.showNotification(error.message, 'error');
            await signOut(auth);
        }
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
    
    await AuthUtils.verifyStudentRole(user);
    AuthUtils.showNotification('Login successful! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'student-dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    AuthUtils.showNotification(error.message, 'error');
    if (auth.currentUser) {
        await signOut(auth);
    }
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
    
    await AuthUtils.verifyStudentRole(user);
    AuthUtils.showNotification('Login successful! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'student-dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('Google login error:', error);
    AuthUtils.showNotification(error.message, 'error');
    if (auth.currentUser) {
        await signOut(auth);
    }
  }
});


