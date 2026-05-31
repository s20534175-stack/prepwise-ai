const express = require('express');
const router = express.Router();
const { startInterview, submitAnswer, completeInterview, getHistory, getInterview } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startInterview);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/complete', protect, completeInterview);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getInterview);

module.exports = router;
