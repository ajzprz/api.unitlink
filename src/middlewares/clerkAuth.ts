const { requireSession } = require('@clerk/express');
const clerkAuthMiddleware = requireSession();

module.exports = { clerkAuthMiddleware };
