const validator = require('validator');

const validateEmail = (email) => {
  return email && validator.isEmail(email);
};

const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

const validateRegistration = (email, phone) => {
  if (!email && !phone) {
    return { valid: false, error: 'Either email or phone is required' };
  }
  
  if (email && !validateEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (phone && !validatePhone(phone)) {
    return { valid: false, error: 'Invalid phone format' };
  }
  
  return { valid: true };
};

module.exports = {
  validateEmail,
  validatePhone,
  validateRegistration
};
