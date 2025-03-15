const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const morgan = require('morgan');
const { parse } = require('node-html-parser');
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

// Helper functions for filename generation
const sanitizeFilename = (title) => {
  return title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

const truncateFilename = (filename, maxLength = 100) => {
  return filename.length > maxLength ? filename.slice(0, maxLength) : filename;
};

const generateFilename = (title) => {
  const sanitized = sanitizeFilename(title);
  const truncated = truncateFilename(sanitized);
  return `${truncated}.md`;
};

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

    const responseHtml = await response.text();
    const document = parse(responseHtml);

    // Extract page title
    const pageTitle = document.querySelector('title')?.text || 'Untitled';

    // Generate filename
    const filename = generateFilename(pageTitle);

    // Find content (prioritize article, then main)
    let content = document.querySelector('article') || document.querySelector('main');

    // If neither <article> nor <main> is found, use the entire body
    const html = content ? content.innerHTML : document.body.innerHTML;

    // Return html and filename for use by app.js
    res.json({
      html: html,
      filename: filename
    });

  } catch (error) {
    console.error(`[Error] Failed to fetch URL: ${req.body.url}`);
    console.error(`[Details] ${error.message}`);
    next(error);
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