const bcrypt = require('bcryptjs');
const database = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = database.getDb();

    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, name, bio, created_at, updated_at FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving profile',
      code: 'PROFILE_RETRIEVAL_ERROR'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, bio, email } = req.body;
    const db = database.getDb();

    // Check if user exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // If email is being updated, check if it's already taken by another user
    if (email) {
      const emailExists = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (emailExists) {
        return res.status(400).json({
          error: 'Email address is already in use by another user',
          code: 'EMAIL_EXISTS'
        });
      }
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields provided for update',
        code: 'NO_UPDATE_FIELDS'
      });
    }

    updateFields.push('updated_at = datetime("now")');
    updateValues.push(userId);

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

    // Update user
    await new Promise((resolve, reject) => {
      db.run(updateQuery, updateValues, function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    // Get updated user
    const updatedUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, name, bio, created_at, updated_at FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error while updating profile',
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = database.getDb();

    // Delete user (this will also cascade delete refresh tokens due to foreign key)
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    if (result === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Internal server error while deleting account',
      code: 'ACCOUNT_DELETION_ERROR'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
