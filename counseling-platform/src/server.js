const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');
const firebaseConfig = require('./config/firebaseConfig');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseConfig),
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});