const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member is required']
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HRUser',
    required: [true, 'Issued by HR is required']
  },
  title: {
    type: String,
    required: [true, 'Warning title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Warning description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: [true, 'Severity is required']
  },
  category: {
    type: String,
    enum: ['Attendance', 'Performance', 'Behavior', 'Policy Violation', 'Other'],
    required: [true, 'Category is required']
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'Dismissed'],
    default: 'Active'
  },
  dueDate: {
    type: Date,
    default: function() {
      // Default due date is 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  resolvedDate: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HRUser',
    default: null
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
warningSchema.index({ member: 1, status: 1 });
warningSchema.index({ issuedBy: 1 });

// Pre-save middleware to update member's total warnings
warningSchema.post('save', async function() {
  if (this.isNew) {
    const Member = mongoose.model('Member');
    await Member.findByIdAndUpdate(
      this.member,
      { $inc: { totalWarnings: 1 } }
    );
  }
});

// Update member's warning count when status changes to resolved
warningSchema.pre('findOneAndUpdate', async function() {
  const update = this.getUpdate();
  if (update.status === 'Resolved') {
    const warning = await this.model.findOne(this.getQuery());
    if (warning && warning.status !== 'Resolved') {
      const Member = mongoose.model('Member');
      await Member.findByIdAndUpdate(
        warning.member,
        { $inc: { totalWarnings: -1 } }
      );
    }
  }
});

module.exports = mongoose.model('Warning', warningSchema);