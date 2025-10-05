const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HRUser',
    required: [true, 'Sender is required']
  },
  emailType: {
    type: String,
    enum: ['Onboarding', 'Warning', 'Custom', 'Announcement'],
    required: [true, 'Email type is required']
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  body: {
    type: String,
    required: [true, 'Email body is required']
  },
  templateUsed: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Sent', 'Failed', 'Pending'],
    default: 'Pending'
  },
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  openedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  attachments: [{
    filename: String,
    size: Number,
    mimetype: String
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['Dashboard', 'Bulk', 'Automated'],
      default: 'Dashboard'
    }
  },
  relatedWarning: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warning',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
emailLogSchema.index({ recipient: 1, createdAt: -1 });
emailLogSchema.index({ sender: 1, createdAt: -1 });
emailLogSchema.index({ emailType: 1, status: 1 });

// Update email status method
emailLogSchema.methods.updateStatus = function(status, additionalData = {}) {
  this.status = status;
  
  if (status === 'Sent') {
    this.sentAt = new Date();
  } else if (status === 'Failed' && additionalData.reason) {
    this.failureReason = additionalData.reason;
  }
  
  return this.save();
};

module.exports = mongoose.model('EmailLog', emailLogSchema);