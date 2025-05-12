// Import Firebase modules
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { app } from './firebase-config.js';
import { SessionsManager } from './sessions-manager.js';
import { AuthUtils } from './auth-utils.js';

// Tab navigation handler
function initializeTabNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show selected tab content
            const tabPanes = document.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => {
                if (pane.getAttribute('data-tab') === targetTab) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}

// Get Auth instance
const auth = getAuth(app);

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    try {
        if (!user) {
            // No user is signed in, redirect to login
            window.location.href = 'student-login.html';
            return;
        }

        // Verify student role
        await AuthUtils.verifyStudentRole(user);
    } catch (error) {
        AuthUtils.showNotification(error.message, 'error');
        // Sign out and redirect after a short delay to show the error
        setTimeout(async () => {
            await signOut(auth);
            window.location.href = 'student-login.html';
        }, 2000);
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

    // Initialize tab navigation
    initializeTabNavigation();

    // Initialize sessions manager
    const sessionsManager = new SessionsManager();

    document.getElementById('logout').addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            AuthUtils.showNotification('Error signing out. Please try again.', 'error');
        }
    });
});
