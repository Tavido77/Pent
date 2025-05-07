// This file contains the JavaScript code for the frontend functionality, including user interactions, form submissions, and real-time chat features.

document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Handle user registration
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const userType = document.querySelector('input[name="userType"]:checked').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Save user type in Firestore
                return db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    userType: userType
                });
            })
            .then(() => {
                alert('Registration successful!');
                // Redirect or update UI
            })
            .catch(error => {
                console.error('Error during registration:', error);
                alert(error.message);
            });
    });

    // Handle user login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                alert('Login successful!');
                // Redirect or update UI
            })
            .catch(error => {
                console.error('Error during login:', error);
                alert(error.message);
            });
    });

    // Real-time chat functionality
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const message = chatInput.value;
            const userId = auth.currentUser.uid;

            db.collection('chats').add({
                userId: userId,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            chatInput.value = '';
        }
    });

    // Listen for new chat messages
    db.collection('chats').orderBy('timestamp')
        .onSnapshot(snapshot => {
            chatMessages.innerHTML = '';
            snapshot.forEach(doc => {
                const msg = doc.data();
                const messageElement = document.createElement('div');
                messageElement.textContent = msg.message;
                chatMessages.appendChild(messageElement);
            });
        });
});