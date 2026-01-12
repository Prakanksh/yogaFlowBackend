const mongoose = require('mongoose');

const bodyPartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Body part name is required'],
    trim: true,
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

bodyPartSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('BodyPart', bodyPartSchema);
