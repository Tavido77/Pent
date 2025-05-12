// Import Firebase modules
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

async function checkAccount(user) {
    try {
        // Check students collection
        const studentDoc = await getDoc(doc(db, 'students', user.uid));
        if (studentDoc.exists()) {
            const data = studentDoc.data();
            console.log('Found student account:', {
                uid: user.uid,
                email: user.email,
                ...data
            });
            return;
        }

        // Check counselors collection
        const counselorDoc = await getDoc(doc(db, 'counselors', user.uid));
        if (counselorDoc.exists()) {
            const data = counselorDoc.data();
            console.log('Found counselor account:', {
                uid: user.uid,
                email: user.email,
                ...data
            });
            return;
        }

        console.log('Account not found in either students or counselors collection:', {
            uid: user.uid,
            email: user.email
        });

    } catch (error) {
        console.error('Error checking account:', error);
    }
}

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('Checking account for:', user.email);
        await checkAccount(user);
    } else {
        console.log('No user is signed in. Please sign in to check your account.');
    }
});
