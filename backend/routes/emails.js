const express = require('express');
const EmailLog = require('../models/EmailLog');
const { authMiddleware } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const emailService = require('../controllers/emailController');

const router = express.Router();

// @route   POST /api/emails/send
// @desc    Send custom email to members
// @access  Private
router.post('/send', authMiddleware, validate('sendEmail'), async (req, res) => {
  try {
    const result = await emailService.sendCustomEmail(req.body, req.user._id);
    
    res.json({
      message: 'Emails processed successfully',
      results: result.results
    });

  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ 
      message: 'Server error sending emails',
      error: error.message 
    });
  }
});

// @route   GET /api/emails/logs
// @desc    Get email logs with filtering and pagination
// @access  Private
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      emailType = '',
      status = '',
      sender = '',
      recipient = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (emailType) filter.emailType = emailType;
    if (status) filter.status = status;
    if (sender) filter.sender = sender;
    if (recipient) filter.recipient = recipient;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      EmailLog.find(filter)
        .populate('recipient', 'name email studentId')
        .populate('sender', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      EmailLog.countDocuments(filter)
    ]);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalLogs: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ 
      message: 'Server error fetching email logs' 
    });
  }
});

// @route   GET /api/emails/logs/:id
// @desc    Get single email log by ID
// @access  Private
router.get('/logs/:id', authMiddleware, async (req, res) => {
  try {
    const log = await EmailLog.findById(req.params.id)
      .populate('recipient', 'name email studentId department')
      .populate('sender', 'name email')
      .populate('relatedWarning', 'title severity category');
    
    if (!log) {
      return res.status(404).json({ 
        message: 'Email log not found' 
      });
    }

    res.json({ log });

  } catch (error) {
    console.error('Get email log error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid email log ID format' 
      });
    }
    res.status(500).json({ 
      message: 'Server error fetching email log' 
    });
  }
});

// @route   GET /api/emails/templates
// @desc    Get available email templates
// @access  Private
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    const templates = [
      {
        id: 'onboarding',
        name: 'Onboarding Welcome',
        description: 'Welcome email for new members',
        type: 'Onboarding',
        variables: ['memberName', 'studentId', 'department', 'position', 'joinDate']
      },
      {
        id: 'warning',
        name: 'Warning Notice',
        description: 'Official warning notice',
        type: 'Warning',
        variables: ['memberName', 'warningTitle', 'warningDescription', 'severity', 'category', 'dueDate']
      },
      {
        id: 'custom',
        name: 'Custom Message',
        description: 'Custom email template',
        type: 'Custom',
        variables: ['memberName', 'subject', 'content']
      },
      {
        id: 'announcement',
        name: 'Announcement',
        description: 'General announcements',
        type: 'Announcement',
        variables: ['memberName', 'announcementTitle', 'announcementContent', 'eventDate']
      }
    ];

    res.json({ templates });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ 
      message: 'Server error fetching templates' 
    });
  }
});

// @route   GET /api/emails/stats
// @desc    Get email statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalEmails,
      sentEmails,
      failedEmails,
      emailsByType,
      emailsByStatus,
      recentLogs
    ] = await Promise.all([
      EmailLog.countDocuments(dateFilter),
      EmailLog.countDocuments({ ...dateFilter, status: 'Sent' }),
      EmailLog.countDocuments({ ...dateFilter, status: 'Failed' }),
      EmailLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$emailType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      EmailLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      EmailLog.find(dateFilter)
        .populate('recipient', 'name email')
        .populate('sender', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    const successRate = totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(2) : 0;

    res.json({
      overview: {
        totalEmails,
        sentEmails,
        failedEmails,
        pendingEmails: totalEmails - sentEmails - failedEmails,
        successRate: parseFloat(successRate)
      },
      breakdown: {
        byType: emailsByType,
        byStatus: emailsByStatus
      },
      recentActivity: recentLogs
    });

  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ 
      message: 'Server error fetching email statistics' 
    });
  }
});

// @route   POST /api/emails/resend/:id
// @desc    Resend failed email
// @access  Private
router.post('/resend/:id', authMiddleware, async (req, res) => {
  try {
    const emailLog = await EmailLog.findById(req.params.id)
      .populate('recipient', 'name email');
    
    if (!emailLog) {
      return res.status(404).json({ 
        message: 'Email log not found' 
      });
    }

    if (emailLog.status === 'Sent') {
      return res.status(400).json({ 
        message: 'Email was already sent successfully' 
      });
    }

    // Resend email
    const emailResult = await emailService.sendEmail({
      to: emailLog.recipient.email,
      subject: emailLog.subject,
      html: emailLog.body
    });

    if (emailResult.success) {
      await emailLog.updateStatus('Sent');
      res.json({
        message: 'Email resent successfully',
        log: emailLog
      });
    } else {
      await emailLog.updateStatus('Failed', { reason: emailResult.error });
      res.status(500).json({
        message: 'Failed to resend email',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Resend email error:', error);
    res.status(500).json({ 
      message: 'Server error resending email' 
    });
  }
});

module.exports = router;