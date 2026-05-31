// routes/questions.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateQuestions } = require('../utils/gemini');

// @desc    Generate interview questions on demand
// @route   POST /api/questions/generate
// @access  Private
router.post('/generate', protect, async (req, res) => {
  const { jobRole, type, difficulty, count } = req.body;
  if (!jobRole) {
    return res.status(400).json({ success: false, message: 'Job role is required.' });
  }
  const questions = await generateQuestions(
    jobRole,
    type || 'hr',
    difficulty || 'medium',
    Math.min(parseInt(count) || 5, 10)
  );
  res.json({ success: true, data: questions });
});

module.exports = router;
