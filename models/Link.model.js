const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  invitedEmail: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate links
linkSchema.index({ caretakerId: 1, patientId: 1 }, { unique: true });

module.exports = mongoose.model('Link', linkSchema);
