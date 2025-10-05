const jwt = require('jsonwebtoken');
const HRUser = require('../models/HRUser');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key-for-testing');
    
    // Check if it's a demo user
    let user;
    if (decoded.id.startsWith('demo-')) {
      // Demo user - create user object from token data
      user = {
        _id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        isActive: true
      };
    } else {
      // Try to find real user in database
      try {
        user = await HRUser.findById(decoded.id).select('-password');
      } catch (dbError) {
        console.log('Database not available for user lookup');
        return res.status(401).json({ 
          message: 'Database not available. Please use demo credentials.' 
        });
      }
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token is not valid. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in authentication.' 
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin role required.' 
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };