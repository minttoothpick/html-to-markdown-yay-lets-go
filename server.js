const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const morgan = require('morgan');
const app = express();
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
console.log('Environment: ', env);

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Use Morgan for detailed request logging in development mode
if (env === 'development') {
  app.use(morgan('dev')); // Logs HTTP requests in a concise format
}

// Proxy endpoint to fetch HTML content
app.post('/fetch-html', async (req, res, next) => {
  try {
    const response = await fetch(req.body.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText} (HTTP ${response.status})`);
    }

    const html = await response.text();
    res.send(html);
  } catch (error) {
    console.error(`[Error] Failed to fetch URL: ${req.body.url}`);
    console.error(`[Details] ${error.message}`);
    next(error); // Pass the error to the error-handling middleware
  }
});

// Error-handling middleware
app.use((err, req, res, next) => {
  // Log detailed error information in development mode
  if (env === 'development') {
    console.error(`[Error Stack] ${err.stack}`);
    console.error(`[Request Body] ${JSON.stringify(req.body, null, 2)}`);
  } else {
    console.error(`[Error] ${err.message}`);
  }

  // Respond with a detailed error message in development mode or generic message in production
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(env === 'development' && { stack: err.stack }) // Include stack trace only in development mode
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env} mode`);
});