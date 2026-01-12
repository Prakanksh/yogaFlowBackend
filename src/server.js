const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const env = require('./config/env');
const securityHeaders = require('./middleware/security');

const app = express();

// Security headers (production only)
securityHeaders(app);

// Security: CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = env.corsOrigin.split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin) || env.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Yoga Flow Backend API is running' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
const routes = require('./routes');
app.use('/api', routes);

// Error Handler (must be after all routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
connectDB().then(async () => {
  // Seed default data on startup
  try {
    const { seedDefaultDiseases } = require('./utils/seedDiseases');
    await seedDefaultDiseases();
  } catch (error) {
    console.error('Error seeding default diseases:', error.message);
  }
  
  try {
    const { seedDefaultBodyParts } = require('./utils/seedBodyParts');
    await seedDefaultBodyParts();
  } catch (error) {
    console.error('Error seeding default body parts:', error.message);
  }
  
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  });
});

module.exports = app;
