const express = require('express');
const jwt = require('jsonwebtoken');
const HRUser = require('../models/HRUser');
const { validate } = require('../middlewares/validation');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login HR user
// @access  Public
router.post('/login', validate('login'), async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Demo credentials for testing when MongoDB is not available
    const demoUsers = [
      {
        _id: 'demo-admin-001',
        name: 'Admin User',
        email: 'admin@codingninjasclub.com',
        password: 'admin123',
        role: 'admin',
        department: 'Administration',
        isActive: true
      }
    ];

    // Check demo credentials first
    console.log('Checking demo credentials for:', email);
    const demoUser = demoUsers.find(u => u.email === email && u.password === password);
    console.log('Demo user found:', !!demoUser);
    if (demoUser) {
      const token = jwt.sign(
        { 
          id: demoUser._id, 
          email: demoUser.email, 
          role: demoUser.role 
        },
        process.env.JWT_SECRET || 'demo-secret-key-for-testing',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const userResponse = {
        _id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        department: demoUser.department,
        isActive: demoUser.isActive,
        lastLogin: new Date()
      };

      return res.json({
        message: 'Login successful (Demo Mode)',
        token,
        user: userResponse
      });
    }

    // Try database authentication if demo credentials don't match
    let user;
    try {
      user = await HRUser.findOne({ email }).select('+password');
    } catch (dbError) {
      console.log('Database not available, demo credentials only');
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated. Contact administrator.' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new HR user (admin only)
// @access  Private (Admin)
router.post('/register', authMiddleware, validate('register'), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin role required.' 
      });
    }

    const { name, email, password, department, role } = req.body;

    // Check if user already exists
    const existingUser = await HRUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const newUser = new HRUser({
      name,
      email,
      password,
      department,
      role: role || 'hr'
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'HR user created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await HRUser.findById(req.user.id);
    res.json({
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Server error getting profile' 
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'department', 'avatar'];
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await HRUser.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error updating profile' 
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await HRUser.findById(req.user.id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Server error changing password' 
    });
  }
});

module.exports = router;