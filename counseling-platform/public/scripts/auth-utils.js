// Import Firebase modules
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

// Enable persistent auth state
setPersistence(auth, browserLocalPersistence);

export class AuthUtils {
    static async verifyStudentRole(user) {
        if (!user) {
            throw new Error('No user provided');
        }
        
        try {
            // First check if this is a counselor account
            const counselorDoc = await getDoc(doc(db, 'counselors', user.uid));
            if (counselorDoc.exists()) {
                throw new Error('Access denied: Counselor account detected. Please use the counselor portal.');
            }

            // Then check if it's a valid student account
            const studentDoc = await getDoc(doc(db, 'students', user.uid));
            if (!studentDoc.exists()) {
                throw new Error('Student account not found. Please contact support for assistance.');
            }

            // Check if student account is active
            const studentData = studentDoc.data();
            if (studentData.active === false) {
                throw new Error('Your student account is currently inactive. Please contact support.');
            }

            return true;
        } catch (error) {
            console.error('Student role verification error:', error);
            throw error;
        }
    }

    static async verifyCounselorRole(user) {
        if (!user) return false;
        
        try {
            const studentDoc = await getDoc(doc(db, 'students', user.uid));
            if (studentDoc.exists()) {
                throw new Error('Access denied: Student account detected. Please use the student portal.');
            }

            const counselorDoc = await getDoc(doc(db, 'counselors', user.uid));
            if (!counselorDoc.exists()) {
                throw new Error('Account not found. Please contact the administrator.');
            }

            if (!counselorDoc.data().active) {
                throw new Error('Your counselor account is currently inactive. Please contact the administrator.');
            }

            return true;
        } catch (error) {
            console.error('Counselor role verification error:', error);
            throw error;
        }
    }

    static showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add notification styles if not present
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    max-width: 350px;
                    animation: slideIn 0.3s ease-out;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-icon {
                    font-size: 20px;
                }
                .notification-error {
                    background-color: #fee2e2;
                    border: 1px solid #ef4444;
                    color: #991b1b;
                }
                .notification-success {
                    background-color: #dcfce7;
                    border: 1px solid #22c55e;
                    color: #166534;
                }
                .notification-info {
                    background-color: #dbeafe;
                    border: 1px solid #3b82f6;
                    color: #1e40af;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}
