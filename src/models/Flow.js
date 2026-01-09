const mongoose = require('mongoose');

const flowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Flow name is required'],
    trim: true
  },
  madeBy: {
    type: String,
    enum: ['user', 'teacher', 'system'],
    required: true
  },
  madeById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.madeBy !== 'system';
    }
  },
  asanas: [{
    asana: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asana',
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  }],
  levels: [{
    type: String,
    enum: ['child', 'beginner', 'average', 'intermediate', 'advanced', 'old']
  }],
  bodyParts: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  estimatedTimeRange: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    }
  },
  purpose: {
    type: String,
    enum: ['practice', 'heal', 'learn'],
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

flowSchema.index({ madeBy: 1, madeById: 1 });
flowSchema.index({ purpose: 1 });
flowSchema.index({ levels: 1 });
flowSchema.index({ bodyParts: 1 });
flowSchema.index({ isPublic: 1, isActive: 1 });
flowSchema.index({ 'asanas.asana': 1 });

flowSchema.pre('save', function(next) {
  if (this.asanas && this.asanas.length > 0) {
    this.asanas.sort((a, b) => a.order - b.order);
  }
  next();
});

module.exports = mongoose.model('Flow', flowSchema);
