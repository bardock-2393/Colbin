const bcrypt = require('bcryptjs');
const database = require('../config/database');
const { 
  generateTokens, 
  verifyRefreshToken, 
  storeRefreshToken, 
  removeRefreshToken, 
  isRefreshTokenValid 
} = require('../middleware/auth');

const register = async (req, res) => {
  try {
    const { email, password, name, bio } = req.body;
    const db = database.getDb();

    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email address',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password_hash, name, bio) VALUES (?, ?, ?, ?)',
        [email, passwordHash, name || null, bio || null],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId);
    
    // Store refresh token
    await storeRefreshToken(refreshToken, userId);

    // Get created user (without password)
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, name, bio, created_at FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration',
      code: 'REGISTRATION_ERROR'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = database.getDb();

    // Find user
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, password_hash, name, bio, created_at FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Store refresh token
    await storeRefreshToken(refreshToken, user.id);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login',
      code: 'LOGIN_ERROR'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token is valid and not expired
    const isValid = await isRefreshTokenValid(refreshToken);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Decode refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const tokens = generateTokens(decoded.userId);
    
    // Remove old refresh token and store new one
    await removeRefreshToken(refreshToken);
    await storeRefreshToken(tokens.refreshToken, decoded.userId);

    res.json({
      message: 'Tokens refreshed successfully',
      tokens
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      code: 'REFRESH_TOKEN_ERROR'
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await removeRefreshToken(refreshToken);
    }

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error during logout',
      code: 'LOGOUT_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
