const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

// Import database connection
// const connectDB = require('./utils/db');

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const customerRoutes = require('./routes/customerRoutes');
const businessRoutes = require('./routes/businessRoutes');

// Initialize Express app
const app = express();

const PORT = process.env.PORT || 3000;
console.log('MONGODB_URI:', process.env.MONGODB_URI);
// Connect to database and start application
const startApplication = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Handlebars configuration
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layout'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    // Custom helpers
    formatDate: (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    },
    formatPoints: (points) => {
      if (points === null || points === undefined || isNaN(points)) {
        return '0';
      }
      return Number(points).toLocaleString();
    },
    safeLength: (array) => {
      if (!array || !Array.isArray(array)) {
        return 0;
      }
      return array.length;
    },
    safeValue: (value, defaultValue = 0) => {
      if (value === null || value === undefined) {
        return defaultValue;
      }
      return value;
    },
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b
  }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', pageRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/business', businessRoutes);

// 404 handler
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  res.status(404).render('404', {
    title: 'Page Not Found - Fades n Braids',
    layout: 'main'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  res.status(statusCode).render('error', {
    title: 'Error - Fades n Braids',
    message,
    layout: 'main'
  });
});

startApplication();

module.exports = app;