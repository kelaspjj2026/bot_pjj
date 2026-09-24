const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3001,
  BASE_PATH: process.env.BASE_PATH || '/bot',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/helpdesk_bot',
  SESSIONS_DIR: path.join(__dirname, '..', '..', 'sessions'),
  UPLOAD_DIR: path.join(__dirname, '..', '..', 'uploads'),
  PUBLIC_URL: process.env.PUBLIC_URL || 'https://cswa.latifdev.com/bot',
  // Google Apps Script Library ID untuk integrasi Arsip Bot
  GAS_LIBRARY_ID: process.env.GAS_LIBRARY_ID || '1tymqZa1CXCxYVqiqFzPAhu3xD9GLMUaTqvP3RNkwlLii1CbSrepRJbf9',
};
