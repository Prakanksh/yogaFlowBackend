const mongoose = require('mongoose');

const asanaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asana name is required'],
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  alignment: {
    text: {
      type: String,
      trim: true
    },
    images: [{
      type: String,
      trim: true
    }],
    audio: {
      type: String,
      trim: true
    },
    video: {
      type: String,
      trim: true
    }
  },
  steps: {
    text: {
      type: String,
      trim: true
    },
    images: [{
      type: String,
      trim: true
    }],
    audio: {
      type: String,
      trim: true
    },
    video: {
      type: String,
      trim: true
    }
  },
  addedBy: {
    type: String,
    enum: ['admin', 'teacher', 'system'],
    required: true
  },
  addedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.addedBy !== 'system';
    }
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  level: {
    type: String,
    enum: ['child', 'beginner', 'average', 'intermediate', 'advanced', 'old'],
    required: true
  },
  bodyParts: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  preparatoryFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asana'
  }],
  modifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asana'
  }],
  modificationTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asana'
  }],
  notes: {
    type: String,
    trim: true
  },
  diseaseAllowed: [{
    disease: {
      type: String,
      lowercase: true,
      required: true
    },
    allowedLevel: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    }
  }],
  exemptFrom: {
    diseases: [{
      type: String,
      lowercase: true
    }],
    injuries: [{
      bodyPart: {
        type: String,
        lowercase: true,
        required: true
      },
      minLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: 1
      }
    }]
  },
  recommendedCounterPoses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asana'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

asanaSchema.index({ name: 1 });
asanaSchema.index({ level: 1 });
asanaSchema.index({ bodyParts: 1 });
asanaSchema.index({ addedBy: 1, addedById: 1 });
asanaSchema.index({ isPrivate: 1, isActive: 1 });

module.exports = mongoose.model('Asana', asanaSchema);
