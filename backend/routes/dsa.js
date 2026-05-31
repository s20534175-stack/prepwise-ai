// routes/dsa.js
const express = require('express');
const router = express.Router();
const { logProblem, getProblems, getAnalytics, deleteProblem } = require('../controllers/dsaController');
const { protect } = require('../middleware/auth');

router.post('/log', protect, logProblem);
router.get('/problems', protect, getProblems);
router.get('/analytics', protect, getAnalytics);
router.delete('/:id', protect, deleteProblem);

module.exports = router;
