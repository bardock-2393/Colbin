const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin, validateRefreshToken } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, authController.register);

// @route   POST /api/auth/login
// @desc    Login user and return JWT tokens
// @access  Public
router.post('/login', validateLogin, authController.login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh', validateRefreshToken, authController.refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate refresh token
// @access  Public
router.post('/logout', authController.logout);

module.exports = router;
