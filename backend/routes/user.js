const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// @route   GET /api/user/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authenticateToken, userController.getProfile);

// @route   PUT /api/user/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', authenticateToken, validateProfileUpdate, userController.updateProfile);

// @route   DELETE /api/user/account
// @desc    Delete current user's account
// @access  Private
router.delete('/account', authenticateToken, userController.deleteAccount);

module.exports = router;
