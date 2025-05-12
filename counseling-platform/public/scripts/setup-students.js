// Import Firebase modules
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

async function createStudent(email, password, studentData) {
    try {
        // Create the auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create the student document in Firestore
        await setDoc(doc(db, 'students', user.uid), {
            email: email,
            name: studentData.name,
            grade: studentData.grade,
            active: true,
            createdAt: new Date().toISOString(),
            ...studentData
        });

        console.log(`Successfully created student: ${email}`);
        return user.uid;
    } catch (error) {
        console.error(`Error creating student ${email}:`, error);
        throw error;
    }
}

// Example student data
const students = [
    {
        email: "student1@example.com",
        password: "student123", // Change this!
        name: "Student One",
        grade: "11"
    },
    // Add more students as needed
];

// Create all students
async function setupStudents() {
    for (const student of students) {
        try {
            await createStudent(student.email, student.password, student);
            console.log(`Created student account for ${student.email}`);
        } catch (error) {
            console.error(`Failed to create student ${student.email}:`, error.message);
        }
    }
}

// Run the setup
setupStudents().then(() => {
    console.log('Finished creating student accounts');
}).catch(console.error);
