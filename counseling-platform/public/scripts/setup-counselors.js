import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

// Predefined counselor details
const counselors = [
    {
        email: 'counselor1@decide.com',
        password: 'decide2025#1',
        name: 'Dr. Sarah Johnson',
        specialization: 'Academic Counseling'
    },
    {
        email: 'counselor2@decide.com',
        password: 'decide2025#2',
        name: 'Dr. Michael Chen',
        specialization: 'Career Guidance'
    },
    {
        email: 'counselor3@decide.com',
        password: 'decide2025#3',
        name: 'Dr. Emily Rodriguez',
        specialization: 'Personal Development'
    }
];

async function setupCounselors() {
    const results = document.getElementById('results');
    
    for (const counselor of counselors) {
        try {
            // Create authentication account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                counselor.email,
                counselor.password
            );

            // Add counselor data to Firestore
            await setDoc(doc(db, 'counselors', userCredential.user.uid), {
                name: counselor.name,
                email: counselor.email,
                specialization: counselor.specialization,
                active: true,
                createdAt: new Date(),
                workingHours: {
                    start: '09:00',
                    end: '17:00'
                },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            });

            results.innerHTML += `<p class="success">✓ Successfully set up ${counselor.name} (${counselor.email})</p>`;
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                results.innerHTML += `<p class="warning">⚠ ${counselor.email} already exists</p>`;
            } else {
                results.innerHTML += `<p class="error">✗ Error setting up ${counselor.email}: ${error.message}</p>`;
            }
        }
    }
}

document.getElementById('setupButton').addEventListener('click', async () => {
    const button = document.getElementById('setupButton');
    button.disabled = true;
    button.textContent = 'Setting up counselors...';
    
    await setupCounselors();
    
    button.textContent = 'Setup Complete';
});
