const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/database');
const env = require('./config/env');

const app = express();

// Middleware
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
