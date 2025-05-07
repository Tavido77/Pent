const admin = require('firebase-admin');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    admin.auth().verifyIdToken(token)
        .then(decodedToken => {
            req.user = decodedToken;
            next();
        })
        .catch(error => {
            console.error('Error verifying token:', error);
            return res.status(401).json({ message: 'Unauthorized access' });
        });
};

const checkCounselor = (req, res, next) => {
    if (req.user.role !== 'counselor') {
        return res.status(403).json({ message: 'Forbidden: Counselor access required' });
    }
    next();
};

const checkStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Forbidden: Student access required' });
    }
    next();
};

module.exports = {
    authMiddleware,
    checkCounselor,
    checkStudent
};