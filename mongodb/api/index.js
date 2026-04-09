// Set Vercel environment for server.js
process.env.VERCEL = '1';

const app = require('../server.js');

// Export for Vercel
module.exports = app;
