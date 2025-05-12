import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { app } from './firebase-config.js';

class CounselorManager {
    constructor() {
        this.auth = getAuth(app);
        this.db = getFirestore(app);
    }

    async addCounselor(counselorData) {
        try {
            // Create the user account
            const userCredential = await createUserWithEmailAndPassword(
                this.auth,
                counselorData.email,
                counselorData.password
            );

            const user = userCredential.user;

            // Update the user's profile
            await updateProfile(user, {
                displayName: counselorData.name,
                photoURL: counselorData.photoURL || null
            });

            // Add counselor data to Firestore
            await setDoc(doc(this.db, 'counselors', user.uid), {
                name: counselorData.name,
                email: counselorData.email,
                specialization: counselorData.specialization,
                active: true,
                createdAt: new Date(),
                workingHours: {
                    start: '09:00',
                    end: '17:00'
                },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                maxPatientsPerDay: counselorData.maxPatientsPerDay || 8
            });

            return user;
        } catch (error) {
            console.error('Error adding counselor:', error);
            throw error;
        }
    }
}

// Initialize the form handler
document.addEventListener('DOMContentLoaded', () => {
    const counselorManager = new CounselorManager();
    const form = document.getElementById('addCounselorForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const counselorData = {
                name: form.name.value,
                email: form.email.value,
                password: form.password.value,
                specialization: form.specialization.value,
                photoURL: form.photoURL.value || null,
                maxPatientsPerDay: parseInt(form.maxPatients.value) || 8
            };

            try {
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = 'Adding Counselor...';

                await counselorManager.addCounselor(counselorData);
                
                showNotification('Counselor added successfully!', 'success');
                form.reset();
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = 'Add Counselor';
            }
        });
    }
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
