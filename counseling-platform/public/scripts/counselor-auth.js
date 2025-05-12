import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, collection, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { app } from './firebase-config.js';

class CounselorAuth {
    constructor() {
        this.auth = getAuth(app);
        this.db = getFirestore(app);
    }

    async loginCounselor(email, password) {
        try {
            // First, attempt to sign in
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            
            // After successful sign in, verify if the user is a counselor
            const isCounselor = await this.verifyCounselorRole(userCredential.user.uid);
            
            if (!isCounselor) {
                // If not a counselor, sign out and throw error
                await this.auth.signOut();
                throw new Error('Access denied. This account is not authorized as a counselor.');
            }

            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async verifyCounselorRole(uid) {
        try {
            // First check if this is a student account
            const studentDoc = await getDoc(doc(this.db, 'students', uid));
            if (studentDoc.exists()) {
                throw new Error('This account is registered as a student. Please use the student login portal.');
            }

            // Check the counselors collection in Firestore
            const counselorDoc = await getDoc(doc(this.db, 'counselors', uid));
            
            if (!counselorDoc.exists()) {
                throw new Error('Account not found. Please contact the administrator.');
            }

            if (!counselorDoc.data().active) {
                throw new Error('Your counselor account is currently inactive. Please contact the administrator.');
            }

            return true;
        } catch (error) {
            console.error('Error verifying counselor role:', error);
            throw error;
        }
    }

    async getCurrentCounselor() {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
                unsubscribe(); // Stop listening immediately
                
                if (!user) {
                    resolve(null);
                    return;
                }

                try {
                    const isCounselor = await this.verifyCounselorRole(user.uid);
                    if (!isCounselor) {
                        await this.auth.signOut();
                        resolve(null);
                    } else {
                        resolve(user);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}

export const counselorAuth = new CounselorAuth();
