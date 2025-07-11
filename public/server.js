const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load env vars
require('dotenv').config();

// Route files
const authRoutes = require('../routes/authRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Apply security middleware
const security = require('../middleware/security');
app.use(security.setSecurityHeaders);
app.use(security.sanitizeData);
app.use(security.xssProtection);
app.use(security.preventParamPollution);
app.use(security.limiter);

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Set static folder
app.use(express.static(path.join(__dirname, '../public')));

// Mount routers
app.use('/api/v1/auth', authRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});