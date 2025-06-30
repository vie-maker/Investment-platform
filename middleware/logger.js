
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Custom logger
const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'INFO',
      message,
      ...meta
    };
    console.log(`[${timestamp}] INFO: ${message}`, meta);
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'app.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  },
  
  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'ERROR',
      message,
      error: error.message || error,
      stack: error.stack
    };
    console.error(`[${timestamp}] ERROR: ${message}`, error);
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'error.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  },
  
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'WARN',
      message,
      ...meta
    };
    console.warn(`[${timestamp}] WARN: ${message}`, meta);
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'app.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  }
};

module.exports = logger;
