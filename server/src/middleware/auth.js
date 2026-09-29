const jwt = require('jsonwebtoken');
const { queryRow } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'farmshare_secure_jwt_secret_token_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Session expired or invalid token. Please log in again.' });
    }

    const user = queryRow('SELECT id, name, email, phone, village, taluka, district, state FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
