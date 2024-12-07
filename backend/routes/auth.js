const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateRequest } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, language } = req.body;
        const user = await authService.createUser({
            email,
            password,
            name,
            language
        });
        res.json({
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                name: user.displayName
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Get user profile
router.get('/profile', authenticateRequest, async (req, res) => {
    try {
        const profile = await authService.getUserProfile(req.user.uid);
        res.json({
            success: true,
            profile
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Update user profile
router.put('/profile', authenticateRequest, async (req, res) => {
    try {
        const result = await authService.updateUserProfile(req.user.uid, req.body);
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Delete user account
router.delete('/account', authenticateRequest, async (req, res) => {
    try {
        await authService.deleteUser(req.user.uid);
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Send email verification
router.post('/verify-email', authenticateRequest, async (req, res) => {
    try {
        await authService.verifyEmail(req.user.email);
        res.json({
            success: true,
            message: 'Verification email sent'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Reset password request
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        await authService.resetPassword(email);
        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;