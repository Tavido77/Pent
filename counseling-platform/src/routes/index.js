const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Additional routes can be added here

module.exports = router;