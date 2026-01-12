const validator = require('validator');

const validateEmail = (email) => {
  if (!email) return { valid: true };
  if (!validator.isEmail(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  return { valid: true };
};

const validatePhone = (phone) => {
  if (!phone) return { valid: true };
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, message: 'Invalid phone format' };
  }
  return { valid: true };
};

const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

const validateLevel = (level) => {
  const validLevels = ['child', 'beginner', 'average', 'intermediate', 'advanced', 'old'];
  if (!validLevels.includes(level)) {
    return { valid: false, message: `Invalid level. Must be one of: ${validLevels.join(', ')}` };
  }
  return { valid: true };
};

const validatePurpose = (purpose) => {
  const validPurposes = ['practice', 'heal', 'learn'];
  if (!validPurposes.includes(purpose)) {
    return { valid: false, message: `Invalid purpose. Must be one of: ${validPurposes.join(', ')}` };
  }
  return { valid: true };
};

const validateIntensity = (intensity) => {
  const validIntensities = ['light', 'moderate', 'intense'];
  if (!validIntensities.includes(intensity)) {
    return { valid: false, message: `Invalid intensity. Must be one of: ${validIntensities.join(', ')}` };
  }
  return { valid: true };
};

const validateRegistration = (req, res, next) => {
  const { email, phone, password, role } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: 'Either email or phone is required'
    });
  }
  
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return res.status(400).json({
      success: false,
      message: emailCheck.message
    });
  }
  
  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) {
    return res.status(400).json({
      success: false,
      message: phoneCheck.message
    });
  }
  
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({
      success: false,
      message: passwordCheck.message
    });
  }
  
  if (role && role !== 'user' && role !== 'teacher') {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Only user or teacher allowed during registration'
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, phone, password } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: 'Either email or phone is required'
    });
  }
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateEmail,
  validatePhone,
  validatePassword,
  validateLevel,
  validatePurpose,
  validateIntensity
};
