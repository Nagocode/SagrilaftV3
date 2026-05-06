const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Demasiados intentos desde esta IP, por favor intente de nuevo más tarde.' }
});

router.post('/register', authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/reset-password-request', authLimiter, authController.requestPasswordReset);
router.post('/reset-password', authLimiter, authController.resetPassword);

module.exports = router;
