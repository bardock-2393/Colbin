const jwt = require('jsonwebtoken');
const database = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Access token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({ 
        error: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
    }

    req.user = user;
    next();
  });
};

const generateTokens = (userId) => {
  const payload = { userId };
  
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

const storeRefreshToken = (token, userId) => {
  return new Promise((resolve, reject) => {
    const db = database.getDb();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    db.run(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
      [token, userId, expiresAt.toISOString()],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

const removeRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    const db = database.getDb();
    
    db.run(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [token],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};

const isRefreshTokenValid = (token) => {
  return new Promise((resolve, reject) => {
    const db = database.getDb();
    
    db.get(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime("now")',
      [token],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      }
    );
  });
};

module.exports = {
  authenticateToken,
  generateTokens,
  verifyRefreshToken,
  storeRefreshToken,
  removeRefreshToken,
  isRefreshTokenValid
};
