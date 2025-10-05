const Joi = require('joi');

// Validation schemas
const schemas = {
  // Auth validation
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    department: Joi.string().valid('Technical', 'Management', 'Operations', 'Marketing').required(),
    role: Joi.string().valid('admin', 'hr').default('hr')
  }),

  // Member validation
  createMember: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    studentId: Joi.string().min(3).max(20).required(),
    department: Joi.string().valid('CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'Other').required(),
    year: Joi.number().integer().min(1).max(4).required(),
    position: Joi.string().valid('Member', 'Team Lead', 'Core Team', 'President', 'Vice President', 'Secretary').required(),
    skills: Joi.array().items(Joi.string().trim()),
    socialLinks: Joi.object({
      github: Joi.string().uri().allow(''),
      linkedin: Joi.string().uri().allow(''),
      portfolio: Joi.string().uri().allow('')
    })
  }),

  updateMember: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    department: Joi.string().valid('CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'Other'),
    year: Joi.number().integer().min(1).max(4),
    position: Joi.string().valid('Member', 'Team Lead', 'Core Team', 'President', 'Vice President', 'Secretary'),
    skills: Joi.array().items(Joi.string().trim()),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended'),
    socialLinks: Joi.object({
      github: Joi.string().uri().allow(''),
      linkedin: Joi.string().uri().allow(''),
      portfolio: Joi.string().uri().allow('')
    })
  }),

  // Warning validation
  createWarning: Joi.object({
    member: Joi.string().hex().length(24).required(),
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(1000).required(),
    severity: Joi.string().valid('Low', 'Medium', 'High', 'Critical').required(),
    category: Joi.string().valid('Attendance', 'Performance', 'Behavior', 'Policy Violation', 'Other').required(),
    dueDate: Joi.date().greater('now')
  }),

  // Email validation
  sendEmail: Joi.object({
    recipients: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    subject: Joi.string().min(5).max(200).required(),
    body: Joi.string().min(10).required(),
    emailType: Joi.string().valid('Onboarding', 'Warning', 'Custom', 'Announcement').required(),
    templateUsed: Joi.string().allow('')
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    console.log('Validating with schema:', schema);
    console.log('Request body:', req.body);
    console.log('Password length:', req.body.password ? req.body.password.length : 'undefined');
    
    const { error } = schemas[schema].validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      console.log('Validation error:', errorMessage);
      console.log('Error details:', error.details[0]);
      return res.status(400).json({
        message: 'Validation error',
        error: errorMessage,
        field: error.details[0].path[0]
      });
    }
    
    next();
  };
};

module.exports = { validate, schemas };