const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

const optionalAuthenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = await User.findById(decoded.id).select('-password');
        
        if (req.user && !req.user.isActive) {
          req.user = null;
        }
      } catch (error) {
        req.user = null;
      }
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = { optionalAuthenticate };
