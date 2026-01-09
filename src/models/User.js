const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  phone: {
    type: String,
    trim: true,
    sparse: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'teacher', 'admin'],
    default: 'user'
  },
  profile: {
    name: {
      type: String,
      trim: true
    },
    level: {
      type: String,
      enum: ['child', 'beginner', 'average', 'intermediate', 'advanced', 'old'],
      default: 'beginner'
    },
    diseases: [{
      type: String,
      lowercase: true
    }],
    injuries: [{
      bodyPart: {
        type: String,
        required: true
      },
      level: {
        type: Number,
        min: 1,
        max: 10,
        required: true
      },
      description: String
    }],
    bodyPartsAffected: [{
      type: String
    }],
    preferences: {
      timeRange: {
        min: Number,
        max: Number
      },
      intensity: {
        type: String,
        enum: ['light', 'moderate', 'intense'],
        default: 'moderate'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      email: this.email,
      phone: this.phone
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpire }
  );
};

module.exports = mongoose.model('User', userSchema);
