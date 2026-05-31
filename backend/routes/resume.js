const express = require('express');
const router = express.Router();
const { analyzeResume, getResumeHistory } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/analyze', protect, upload.single('resume'), analyzeResume);
router.get('/history', protect, getResumeHistory);

module.exports = router;
