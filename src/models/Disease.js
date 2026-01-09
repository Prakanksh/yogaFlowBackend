const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Disease name is required'],
    trim: true,
    unique: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  addedBy: {
    type: String,
    enum: ['admin', 'teacher', 'user', 'system'],
    required: true
  },
  addedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

diseaseSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Disease', diseaseSchema);
