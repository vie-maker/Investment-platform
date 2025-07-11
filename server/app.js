const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Load env vars
dotenv.config();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const investments = require('./routes/investments');
const transactions = require('./routes/transactions');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const app = express();

// Body parser
app.use(express.json());

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
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, '../client')));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/investments', investments);
app.use('/api/v1/transactions', transactions);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});