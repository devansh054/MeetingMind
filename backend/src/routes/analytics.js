const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Placeholder routes for analytics
router.get('/meetings/:id', (req, res) => {
  res.json({ message: 'Meeting analytics endpoint - coming in Week 3' });
});

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Dashboard analytics endpoint - coming in Week 3' });
});

module.exports = router;
