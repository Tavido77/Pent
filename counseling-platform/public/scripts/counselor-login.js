import { counselorAuth } from './counselor-auth.js';

// Initialize UI elements
const loginForm = document.getElementById('counselorLoginForm');
const submitButton = loginForm.querySelector('button[type="submit"]');
const errorDisplay = document.createElement('div');
errorDisplay.className = 'error-message';
loginForm.insertBefore(errorDisplay, submitButton);

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        errorDisplay.textContent = '';
        errorDisplay.className = 'error-message';

        await counselorAuth.loginCounselor(email, password);
        
        // Add success message before redirect
        errorDisplay.className = 'success-message';
        errorDisplay.textContent = 'Login successful! Redirecting...';
        
        // Small delay to show success message
        setTimeout(() => {
            window.location.href = 'counselor-dashboard.html';
        }, 1000);
    } catch (error) {
        errorDisplay.className = 'error-message';
        errorDisplay.textContent = error.message || 'An error occurred during login. Please try again.';
        submitButton.disabled = false;
        submitButton.textContent = 'Log In';
    }
});

// Remove Google login since counselors use specific emails
const googleButton = document.querySelector('.google-login');
if (googleButton) googleButton.remove();

const divider = document.querySelector('.divider');
if (divider) divider.remove();

const signupPrompt = document.querySelector('.signup-prompt');
if (signupPrompt) signupPrompt.remove();
