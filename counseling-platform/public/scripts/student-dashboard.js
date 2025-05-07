// Import Firebase modules
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { app } from './firebase-config.js';

// Get Auth instance
const auth = getAuth(app);

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // No user is signed in, redirect to login
        window.location.href = 'student-login.html';
        return;
    }

    // User is signed in, update UI with their info
    const userProfile = document.querySelector('.user-profile img');
    if (user.photoURL) {
        userProfile.src = user.photoURL;
    }

    // Add logout functionality
    document.querySelector('.nav-menu').insertAdjacentHTML('beforeend', `
        <li class="nav-item">
            <a href="#" class="nav-link" id="logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </li>
    `);

    document.getElementById('logout').addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out. Please try again.');
        }
    });
});
