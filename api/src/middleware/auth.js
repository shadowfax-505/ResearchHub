

const jwt = require('jsonwebtoken');

const { jwtSecret: JWT_SECRET } = require('../config');
const User = require('../models/User');
const { isDatabaseUnavailable, sendDatabaseUnavailable } = require('../utils/errors');

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const pair = header.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  try { return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null; } catch { return null; }
}

function getToken(req) {
  return req.headers.authorization?.split(' ')[1] || readCookie(req, 'researchhub_session');
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `researchhub_session=${encodeURIComponent(token)}; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax${secure}`);
}

class AuthMiddleware {
  static async verifyToken(req, res, next) {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header required'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.user_id);
      if (!user || Number(decoded.session_version || 0) !== Number(user.session_version || 0) || user.is_active === 0 || ['banned', 'closed', 'suspended'].includes(user.account_status)) {
        AuthMiddleware.clearSessionCookie(res);
        return res.status(401).json({ error: 'This session is no longer active. Please sign in again.' });
      }
      req.user = { ...decoded, ...user };
      next();
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      return res.status(401).json({
        error: 'Invalid token',
        message: error.message
      });
    }
  }

  static async optionalToken(req, res, next) {
    const token = getToken(req);
    if (!token) {
      req.user = undefined;
      return next();
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.user_id);
      req.user = user && Number(decoded.session_version || 0) === Number(user.session_version || 0) && user.is_active !== 0 && !['banned', 'closed', 'suspended'].includes(user.account_status) ? { ...decoded, ...user } : undefined;
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      req.user = undefined;
    }
    next();
  }

  static verifyRole(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Required role(s): ${roles.join(', ')}`
        });
      }

      next();
    };
  }

  static generateToken(user) {
    return jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        session_version: Number(user.session_version || 0)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static setSessionCookie(res, token) {
    setSessionCookie(res, token);
  }

  static clearSessionCookie(res) {
    res.setHeader('Set-Cookie', 'researchhub_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
  }
}

module.exports = AuthMiddleware;
