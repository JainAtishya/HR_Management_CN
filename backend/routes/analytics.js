const express = require('express');
const Member = require('../models/Member');
const Warning = require('../models/Warning');
const EmailLog = require('../models/EmailLog');
const HRUser = require('../models/HRUser');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics overview
// @access  Private
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const { timeRange = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Try to get data from database, fallback to demo data if database is unavailable
    try {
      const [
        totalMembers,
        activeMembers,
        totalWarnings,
        activeWarnings,
        totalEmails,
        emailsSent,
        newMembersCount,
        recentActivity
      ] = await Promise.all([
        Member.countDocuments(),
        Member.countDocuments({ status: 'Active' }),
        Warning.countDocuments(),
        Warning.countDocuments({ status: 'Active' }),
        EmailLog.countDocuments(),
        EmailLog.countDocuments({ status: 'Sent' }),
        Member.countDocuments({ createdAt: { $gte: startDate } }),
        // Recent activity - last 10 actions
        Promise.all([
          Member.find({ createdAt: { $gte: startDate } })
            .select('name createdAt')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
            .then(members => members.map(m => ({ 
              type: 'Member Added', 
              description: `${m.name} joined the club`,
              date: m.createdAt 
            }))),
          Warning.find({ createdAt: { $gte: startDate } })
            .populate('member', 'name')
            .select('title member createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
          .then(warnings => warnings.map(w => ({ 
            type: 'Warning Issued', 
            description: `Warning issued to ${w.member.name}`,
            date: w.createdAt 
          }))),
        EmailLog.find({ createdAt: { $gte: startDate }, status: 'Sent' })
          .populate('recipient', 'name')
          .select('emailType recipient createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
          .then(emails => emails.map(e => ({ 
            type: 'Email Sent', 
            description: `${e.emailType} email sent to ${e.recipient.name}`,
            date: e.createdAt 
          })))
      ]).then(activities => 
        activities.flat()
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)
      )
    ]);

    const stats = {
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        newThisPeriod: newMembersCount
      },
      warnings: {
        total: totalWarnings,
        active: activeWarnings,
        resolved: totalWarnings - activeWarnings
      },
      emails: {
        total: totalEmails,
        sent: emailsSent,
        failed: totalEmails - emailsSent,
        successRate: totalEmails > 0 ? ((emailsSent / totalEmails) * 100).toFixed(1) : 0
      },
      recentActivity
    };

      res.json(stats);

    } catch (dbError) {
      console.log('Database not available, returning demo analytics data');
      
      // Demo data for when database is not available
      const demoStats = {
        members: {
          total: 45,
          active: 38,
          inactive: 7,
          newThisPeriod: 8
        },
        warnings: {
          total: 12,
          active: 3,
          resolved: 9
        },
        emails: {
          total: 156,
          sent: 148,
          failed: 8,
          successRate: "94.9"
        },
        recentActivity: [
          {
            type: 'Member Added',
            description: 'John Smith joined the club',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            type: 'Warning Issued',
            description: 'Warning issued to Alice Johnson',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            type: 'Email Sent',
            description: 'Welcome email sent to John Smith',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            type: 'Member Added',
            description: 'Sarah Davis joined the club',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            type: 'Email Sent',
            description: 'Monthly newsletter sent to all members',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        ]
      };
      
      res.json(demoStats);
    }

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ 
      message: 'Server error fetching dashboard analytics' 
    });
  }
});

// @route   GET /api/analytics/members
// @desc    Get detailed member analytics
// @access  Private
router.get('/members', authMiddleware, async (req, res) => {
  try {
    // Try to get data from database, fallback to demo data if database is unavailable
    try {
      const [
        membersByDepartment,
        membersByYear,
        membersByPosition,
        membersByStatus,
        joinTrend,
        topMembersWithWarnings
      ] = await Promise.all([
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
      Member.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Member join trend over last 12 months
      Member.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) 
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Members with most warnings
      Member.aggregate([
        { $match: { totalWarnings: { $gt: 0 } } },
        { $sort: { totalWarnings: -1 } },
        { $limit: 10 },
        {
          $project: {
            name: 1,
            email: 1,
            studentId: 1,
            department: 1,
            totalWarnings: 1
          }
        }
      ])
    ]);

      res.json({
        distribution: {
          byDepartment: membersByDepartment,
          byYear: membersByYear,
          byPosition: membersByPosition,
          byStatus: membersByStatus
        },
        trends: {
          joinTrend: joinTrend.map(item => ({
            period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            count: item.count
          }))
        },
        insights: {
          topMembersWithWarnings
        }
      });

    } catch (dbError) {
      console.log('Database not available, returning demo member analytics data');
      
      // Demo member analytics data
      const demoMemberAnalytics = {
        distribution: {
          byDepartment: [
            { _id: 'CSE', count: 18 },
            { _id: 'IT', count: 12 },
            { _id: 'ECE', count: 8 },
            { _id: 'ME', count: 5 },
            { _id: 'EEE', count: 2 }
          ],
          byYear: [
            { _id: 1, count: 15 },
            { _id: 2, count: 12 },
            { _id: 3, count: 10 },
            { _id: 4, count: 8 }
          ],
          byPosition: [
            { _id: 'Member', count: 35 },
            { _id: 'Team Lead', count: 6 },
            { _id: 'Core Team', count: 3 },
            { _id: 'President', count: 1 }
          ],
          byStatus: [
            { _id: 'Active', count: 38 },
            { _id: 'Inactive', count: 7 }
          ]
        },
        trends: {
          joinTrend: [
            { period: '2024-08', count: 8 },
            { period: '2024-09', count: 12 },
            { period: '2024-10', count: 6 }
          ]
        },
        insights: {
          topMembersWithWarnings: [
            {
              _id: 'demo-member-1',
              name: 'Alice Johnson',
              email: 'alice@example.com',
              studentId: 'CS2021001',
              department: 'CSE',
              totalWarnings: 3
            },
            {
              _id: 'demo-member-2',
              name: 'Bob Wilson',
              email: 'bob@example.com',
              studentId: 'IT2021002',
              department: 'IT',
              totalWarnings: 2
            }
          ]
        }
      };
      
      res.json(demoMemberAnalytics);
    }

  } catch (error) {
    console.error('Get member analytics error:', error);
    res.status(500).json({ 
      message: 'Server error fetching member analytics' 
    });
  }
});

// @route   GET /api/analytics/warnings
// @desc    Get detailed warning analytics
// @access  Private
router.get('/warnings', authMiddleware, async (req, res) => {
  try {
    // Try to get data from database, fallback to demo data if database is unavailable
    try {
      const [
        warningsBySeverity,
        warningsByCategory,
        warningsByStatus,
        warningTrend,
        warningsByDepartment,
        avgResolutionTime
      ] = await Promise.all([
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
      // Warning trend over last 12 months
      Warning.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) 
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Warnings by member department
      Warning.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member',
            foreignField: '_id',
            as: 'memberInfo'
          }
        },
        { $unwind: '$memberInfo' },
        { 
          $group: { 
            _id: '$memberInfo.department', 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } }
      ]),
      // Average resolution time
      Warning.aggregate([
        {
          $match: {
            status: 'Resolved',
            resolvedDate: { $exists: true }
          }
        },
        {
          $project: {
            resolutionTime: {
              $subtract: ['$resolvedDate', '$createdAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionTime: { $avg: '$resolutionTime' }
          }
        }
      ])
    ]);

    const avgResolutionDays = avgResolutionTime[0] 
      ? Math.round(avgResolutionTime[0].avgResolutionTime / (1000 * 60 * 60 * 24))
      : 0;

      res.json({
        distribution: {
          bySeverity: warningsBySeverity,
          byCategory: warningsByCategory,
          byStatus: warningsByStatus,
          byDepartment: warningsByDepartment
        },
        trends: {
          warningTrend: warningTrend.map(item => ({
            period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            count: item.count
          }))
        },
        insights: {
          averageResolutionDays: avgResolutionDays
        }
      });

    } catch (dbError) {
      console.log('Database not available, returning demo warning analytics data');
      
      // Demo warning analytics data
      const demoWarningAnalytics = {
        distribution: {
          bySeverity: [
            { _id: 'Medium', count: 6 },
            { _id: 'Low', count: 4 },
            { _id: 'High', count: 2 }
          ],
          byCategory: [
            { _id: 'Attendance', count: 5 },
            { _id: 'Behavior', count: 4 },
            { _id: 'Performance', count: 3 }
          ],
          byStatus: [
            { _id: 'Resolved', count: 9 },
            { _id: 'Active', count: 3 }
          ],
          byDepartment: [
            { _id: 'CSE', count: 6 },
            { _id: 'IT', count: 3 },
            { _id: 'ECE', count: 2 },
            { _id: 'ME', count: 1 }
          ]
        },
        trends: {
          warningTrend: [
            { period: '2024-08', count: 4 },
            { period: '2024-09', count: 5 },
            { period: '2024-10', count: 3 }
          ]
        },
        insights: {
          averageResolutionDays: 7
        }
      };
      
      res.json(demoWarningAnalytics);
    }

  } catch (error) {
    console.error('Get warning analytics error:', error);
    res.status(500).json({ 
      message: 'Server error fetching warning analytics' 
    });
  }
});

// @route   GET /api/analytics/emails
// @desc    Get detailed email analytics
// @access  Private
router.get('/emails', authMiddleware, async (req, res) => {
  try {
    // Try to get data from database, fallback to demo data if database is unavailable
    try {
      const [
        emailsByType,
        emailsByStatus,
        emailTrend,
        emailsByHR,
        deliveryRate
    ] = await Promise.all([
      EmailLog.aggregate([
        { $group: { _id: '$emailType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      EmailLog.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Email trend over last 12 months
      EmailLog.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) 
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Emails sent by HR users
      EmailLog.aggregate([
        {
          $lookup: {
            from: 'hrusers',
            localField: 'sender',
            foreignField: '_id',
            as: 'senderInfo'
          }
        },
        { $unwind: '$senderInfo' },
        { 
          $group: { 
            _id: {
              id: '$senderInfo._id',
              name: '$senderInfo.name'
            }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      // Delivery rate calculation
      EmailLog.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Sent'] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const rate = deliveryRate[0] || { total: 0, sent: 0 };
    const successRate = rate.total > 0 ? ((rate.sent / rate.total) * 100).toFixed(1) : 0;

      res.json({
        distribution: {
          byType: emailsByType,
          byStatus: emailsByStatus,
          byHR: emailsByHR.map(item => ({
            hrName: item._id.name,
            count: item.count
          }))
        },
        trends: {
          emailTrend: emailTrend.map(item => ({
            period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            count: item.count
          }))
        },
        insights: {
          deliveryRate: parseFloat(successRate),
          totalEmails: rate.total,
          successfulEmails: rate.sent,
          failedEmails: rate.total - rate.sent
        }
      });

    } catch (dbError) {
      console.log('Database not available, returning demo email analytics data');
      
      // Demo email analytics data
      const demoEmailAnalytics = {
        distribution: {
          byType: [
            { _id: 'Welcome', count: 25 },
            { _id: 'Warning', count: 12 },
            { _id: 'Newsletter', count: 45 },
            { _id: 'Event', count: 18 }
          ],
          byStatus: [
            { _id: 'Sent', count: 92 },
            { _id: 'Failed', count: 8 }
          ],
          byHR: [
            { hrName: 'Admin User', count: 60 },
            { hrName: 'HR Manager', count: 40 }
          ]
        },
        trends: {
          emailTrend: [
            { period: '2024-08', count: 35 },
            { period: '2024-09', count: 42 },
            { period: '2024-10', count: 23 }
          ]
        },
        insights: {
          deliveryRate: 92.0,
          totalEmails: 100,
          successfulEmails: 92,
          failedEmails: 8
        }
      };
      
      res.json(demoEmailAnalytics);
    }

  } catch (error) {
    console.error('Get email analytics error:', error);
    res.status(500).json({ 
      message: 'Server error fetching email analytics' 
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { type = 'all', format = 'json' } = req.query;
    
    let data = {};
    
    switch (type) {
      case 'members':
        data.members = await Member.find().lean();
        break;
      case 'warnings':
        data.warnings = await Warning.find()
          .populate('member', 'name email studentId')
          .populate('issuedBy', 'name email')
          .lean();
        break;
      case 'emails':
        data.emails = await EmailLog.find()
          .populate('recipient', 'name email')
          .populate('sender', 'name email')
          .lean();
        break;
      default:
        [data.members, data.warnings, data.emails] = await Promise.all([
          Member.find().lean(),
          Warning.find()
            .populate('member', 'name email studentId')
            .populate('issuedBy', 'name email')
            .lean(),
          EmailLog.find()
            .populate('recipient', 'name email')
            .populate('sender', 'name email')
            .lean()
        ]);
    }

    if (format === 'csv') {
      // Simple CSV export - you can enhance this with a proper CSV library
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-data.csv"`);
      
      // Basic CSV conversion - implement based on your needs
      const csv = Object.keys(data).map(key => 
        data[key].map(item => Object.values(item).join(',')).join('\n')
      ).join('\n\n');
      
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-data.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        type,
        data
      });
    }

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ 
      message: 'Server error exporting analytics data' 
    });
  }
});

module.exports = router;