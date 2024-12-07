const { admin } = require('../config/firebase');
const { AuthError } = require('../utils/errors');

const authenticateRequest = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthError('No token provided');
        }

        const token = authHeader.split('Bearer ')[1];
        
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
            };
            next();
        } catch (error) {
            throw new AuthError('Invalid token');
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message || 'Authentication failed'
        });
    }
};