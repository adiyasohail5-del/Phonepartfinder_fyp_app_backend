const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_987654';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


async function hashPassword(plain) {
  return await bcrypt.hash(plain, SALT_ROUNDS);
}


async function comparePassword(plain, hashed) {
  return await bcrypt.compare(plain, hashed);
}

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
};
