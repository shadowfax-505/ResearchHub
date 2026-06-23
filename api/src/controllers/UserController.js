/**
 * User Controller
 * Handles user-related API requests
 */

const User = require('../models/User');
const AuthMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().max(255).required(),
  affiliation: Joi.string().max(255),
  country: Joi.string().max(100)
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

class UserController {
  static async getAll(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = parseInt(req.query.offset) || 0;
      
      const users = await User.findAll(limit, offset);
      const stats = await User.getStats();
      
      res.status(200).json({
        success: true,
        data: users,
        pagination: { limit, offset, total: stats.total }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const user = await User.findById(req.params.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async register(req, res) {
    try {
      // Validate input
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if user exists
      const existingUser = await User.findByUsername(value.username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const existingEmail = await User.findByEmail(value.email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(value.password, 10);

      // Create user
      const userId = await User.create({
        ...value,
        password_hash: hashedPassword
      });

      // Generate token
      const user = await User.findById(userId);
      const token = AuthMiddleware.generateToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user_id: userId, username: user.username },
        token
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      // Validate input
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Find user
      const user = await User.findByUsername(value.username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const passwordValid = await bcrypt.compare(value.password, user.password_hash);
      if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await User.updateLastLogin(user.user_id);

      // Generate token
      const token = AuthMiddleware.generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user_id: user.user_id, username: user.username, role: user.role },
        token
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const userId = req.params.userId;
      
      // Check authorization
      if (req.user.user_id !== parseInt(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updated = await User.update(userId, req.body);
      
      if (updated === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = await User.findById(userId);
      res.status(200).json({ success: true, message: 'User updated', data: user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const userId = req.params.userId;
      
      // Check authorization
      if (req.user.user_id !== parseInt(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const deleted = await User.delete(userId);
      
      if (deleted === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await User.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
