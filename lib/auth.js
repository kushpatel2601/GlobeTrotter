const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter-secret';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookie = request.headers.get('cookie');
  if (cookie) {
    const tokenCookie = cookie.split(';').find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1].trim();
    }
  }
  return null;
}

function getUserFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  getTokenFromRequest,
  getUserFromRequest,
};
