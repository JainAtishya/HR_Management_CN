const express = require('express');
const Member = require('../models/Member');
const { authMiddleware } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const emailService = require('../controllers/emailController');

const router = express.Router();

// @route   GET /api/members
// @desc    Get all members with filtering, sorting, and pagination
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      year = '',
      position = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (position) filter.position = position;
    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [members, total] = await Promise.all([
      Member.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Member.countDocuments(filter)
    ]);

    res.json({
      members,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalMembers: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ 
      message: 'Server error fetching members' 
    });
  }
});

// @route   GET /api/members/:id
// @desc    Get single member by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ 
        message: 'Member not found' 
      });
    }

    res.json({ member });

  } catch (error) {
    console.error('Get member error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid member ID format' 
      });
    }
    res.status(500).json({ 
      message: 'Server error fetching member' 
    });
  }
});

// @route   POST /api/members
// @desc    Create new member and send onboarding email
// @access  Private
router.post('/', authMiddleware, validate('createMember'), async (req, res) => {
  try {
    // Check if member with email or studentId already exists
    const existingMember = await Member.findOne({
      $or: [
        { email: req.body.email },
        { studentId: req.body.studentId.toUpperCase() }
      ]
    });

    if (existingMember) {
      return res.status(400).json({
        message: 'Member with this email or student ID already exists'
      });
    }

    // Create new member
    const member = new Member({
      ...req.body,
      studentId: req.body.studentId.toUpperCase()
    });

    await member.save();

    // Send onboarding email
    try {
      await emailService.sendOnboardingEmail(member._id, req.user._id);
      member.onboardingCompleted = true;
      await member.save();
    } catch (emailError) {
      console.error('Onboarding email error:', emailError);
      // Don't fail member creation if email fails
    }

    res.status(201).json({
      message: 'Member created successfully and onboarding email sent',
      member
    });

  } catch (error) {
    console.error('Create member error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Member with this email or student ID already exists'
      });
    }
    res.status(500).json({ 
      message: 'Server error creating member' 
    });
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', authMiddleware, validate('updateMember'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ 
        message: 'Member not found' 
      });
    }

    // Update member
    const updates = { ...req.body };
    if (updates.studentId) {
      updates.studentId = updates.studentId.toUpperCase();
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Member updated successfully',
      member: updatedMember
    });

  } catch (error) {
    console.error('Update member error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid member ID format' 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email or student ID already exists'
      });
    }
    res.status(500).json({ 
      message: 'Server error updating member' 
    });
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ 
        message: 'Member not found' 
      });
    }

    await Member.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Member deleted successfully'
    });

  } catch (error) {
    console.error('Delete member error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid member ID format' 
      });
    }
    res.status(500).json({ 
      message: 'Server error deleting member' 
    });
  }
});

// @route   GET /api/members/stats/overview
// @desc    Get member statistics overview
// @access  Private
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      membersByDepartment,
      membersByYear,
      membersByPosition,
      recentMembers
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'Active' }),
      Member.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Member.aggregate([
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Member.aggregate([
        { $group: { _id: '$position', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Member.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    res.json({
      overview: {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers
      },
      breakdown: {
        byDepartment: membersByDepartment,
        byYear: membersByYear,
        byPosition: membersByPosition
      },
      recentMembers
    });

  } catch (error) {
    console.error('Get member stats error:', error);
    res.status(500).json({ 
      message: 'Server error fetching member statistics' 
    });
  }
});

module.exports = router;