const express = require('express');
const Warning = require('../models/Warning');
const Member = require('../models/Member');
const { authMiddleware } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const emailService = require('../controllers/emailController');

const router = express.Router();

// @route   GET /api/warnings
// @desc    Get all warnings with filtering, sorting, and pagination
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      member = '',
      severity = '',
      category = '',
      status = '',
      issuedBy = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (member) filter.member = member;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (issuedBy) filter.issuedBy = issuedBy;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [warnings, total] = await Promise.all([
      Warning.find(filter)
        .populate('member', 'name email studentId department')
        .populate('issuedBy', 'name email')
        .populate('resolvedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Warning.countDocuments(filter)
    ]);

    res.json({
      warnings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalWarnings: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get warnings error:', error);
    res.status(500).json({ 
      message: 'Server error fetching warnings' 
    });
  }
});

// @route   GET /api/warnings/:id
// @desc    Get single warning by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const warning = await Warning.findById(req.params.id)
      .populate('member', 'name email studentId department year position')
      .populate('issuedBy', 'name email department')
      .populate('resolvedBy', 'name email');
    
    if (!warning) {
      return res.status(404).json({ 
        message: 'Warning not found' 
      });
    }

    res.json({ warning });

  } catch (error) {
    console.error('Get warning error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid warning ID format' 
      });
    }
    res.status(500).json({ 
      message: 'Server error fetching warning' 
    });
  }
});

// @route   POST /api/warnings
// @desc    Create new warning and send notification email
// @access  Private
router.post('/', authMiddleware, validate('createWarning'), async (req, res) => {
  try {
    // Check if member exists
    const member = await Member.findById(req.body.member);
    if (!member) {
      return res.status(404).json({
        message: 'Member not found'
      });
    }

    // Create new warning
    const warning = new Warning({
      ...req.body,
      issuedBy: req.user._id
    });

    await warning.save();

    // Populate the warning for response and email
    await warning.populate([
      { path: 'member', select: 'name email studentId' },
      { path: 'issuedBy', select: 'name email' }
    ]);

    // Send warning email
    try {
      await emailService.sendWarningEmail(warning, req.body.member, req.user._id);
      warning.emailSent = true;
      warning.emailSentAt = new Date();
      await warning.save();
    } catch (emailError) {
      console.error('Warning email error:', emailError);
      // Don't fail warning creation if email fails
    }

    res.status(201).json({
      message: 'Warning created successfully and notification email sent',
      warning
    });

  } catch (error) {
    console.error('Create warning error:', error);
    res.status(500).json({ 
      message: 'Server error creating warning' 
    });
  }
});

// @route   PUT /api/warnings/:id
// @desc    Update warning
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const warning = await Warning.findById(req.params.id);
    
    if (!warning) {
      return res.status(404).json({ 
        message: 'Warning not found' 
      });
    }

    // Check if user can update this warning
    if (warning.issuedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only update your own warnings.'
      });
    }

    const allowedUpdates = ['title', 'description', 'severity', 'category', 'dueDate'];
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedWarning = await Warning.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'member', select: 'name email studentId department' },
      { path: 'issuedBy', select: 'name email' },
      { path: 'resolvedBy', select: 'name email' }
    ]);

    res.json({
      message: 'Warning updated successfully',
      warning: updatedWarning
    });

  } catch (error) {
    console.error('Update warning error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid warning ID format' 
      });
    }
    res.status(500).json({ 
      message: 'Server error updating warning' 
    });
  }
});

// @route   PUT /api/warnings/:id/resolve
// @desc    Mark warning as resolved
// @access  Private
router.put('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const { resolutionNotes = '' } = req.body;
    
    const warning = await Warning.findById(req.params.id);
    
    if (!warning) {
      return res.status(404).json({ 
        message: 'Warning not found' 
      });
    }

    if (warning.status === 'Resolved') {
      return res.status(400).json({
        message: 'Warning is already resolved'
      });
    }

    const updatedWarning = await Warning.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Resolved',
        resolvedDate: new Date(),
        resolvedBy: req.user._id,
        resolutionNotes
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'member', select: 'name email studentId department' },
      { path: 'issuedBy', select: 'name email' },
      { path: 'resolvedBy', select: 'name email' }
    ]);

    res.json({
      message: 'Warning resolved successfully',
      warning: updatedWarning
    });

  } catch (error) {
    console.error('Resolve warning error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid warning ID format' 
      });
    }
    res.status(500).json({ 
      message: 'Server error resolving warning' 
    });
  }
});

// @route   DELETE /api/warnings/:id
// @desc    Delete warning (admin only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin role required.'
      });
    }

    const warning = await Warning.findById(req.params.id);
    
    if (!warning) {
      return res.status(404).json({ 
        message: 'Warning not found' 
      });
    }

    await Warning.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Warning deleted successfully'
    });

  } catch (error) {
    console.error('Delete warning error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid warning ID format' 
      });
    }
    res.status(500).json({ 
      message: 'Server error deleting warning' 
    });
  }
});

// @route   GET /api/warnings/member/:memberId
// @desc    Get all warnings for a specific member
// @access  Private
router.get('/member/:memberId', authMiddleware, async (req, res) => {
  try {
    const { status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter
    const filter = { member: req.params.memberId };
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const warnings = await Warning.find(filter)
      .populate('issuedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort(sort)
      .lean();

    const warningStats = {
      total: warnings.length,
      active: warnings.filter(w => w.status === 'Active').length,
      resolved: warnings.filter(w => w.status === 'Resolved').length,
      dismissed: warnings.filter(w => w.status === 'Dismissed').length,
      bySeverity: {
        Low: warnings.filter(w => w.severity === 'Low').length,
        Medium: warnings.filter(w => w.severity === 'Medium').length,
        High: warnings.filter(w => w.severity === 'High').length,
        Critical: warnings.filter(w => w.severity === 'Critical').length
      }
    };

    res.json({
      warnings,
      stats: warningStats
    });

  } catch (error) {
    console.error('Get member warnings error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid member ID format' 
      });
    }
    res.status(500).json({ 
      message: 'Server error fetching member warnings' 
    });
  }
});

// @route   GET /api/warnings/stats/overview
// @desc    Get warning statistics overview
// @access  Private
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const [
      totalWarnings,
      activeWarnings,
      warningsBySeverity,
      warningsByCategory,
      warningsByStatus,
      recentWarnings
    ] = await Promise.all([
      Warning.countDocuments(),
      Warning.countDocuments({ status: 'Active' }),
      Warning.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Warning.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Warning.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Warning.find()
        .populate('member', 'name email studentId')
        .populate('issuedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      overview: {
        totalWarnings,
        activeWarnings,
        resolvedWarnings: totalWarnings - activeWarnings
      },
      breakdown: {
        bySeverity: warningsBySeverity,
        byCategory: warningsByCategory,
        byStatus: warningsByStatus
      },
      recentActivity: recentWarnings
    });

  } catch (error) {
    console.error('Get warning stats error:', error);
    res.status(500).json({ 
      message: 'Server error fetching warning statistics' 
    });
  }
});

module.exports = router;