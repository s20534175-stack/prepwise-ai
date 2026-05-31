const pdfParse = require('pdf-parse');
const axios = require('axios');
const User = require('../models/User');
const { analyzeResume } = require('../utils/gemini');

// @desc    Upload resume and get AI analysis
// @route   POST /api/resume/analyze
// @access  Private
exports.analyzeResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a PDF resume.' });
  }

  const { targetRole } = req.body;

  // Download PDF from Cloudinary and parse text
  const response = await axios.get(req.file.path, { responseType: 'arraybuffer' });
  const pdfData = await pdfParse(Buffer.from(response.data));
  const resumeText = pdfData.text;

  if (!resumeText || resumeText.trim().length < 100) {
    return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Make sure it is not a scanned image.' });
  }

  // Run AI analysis
  const analysis = await analyzeResume(resumeText, targetRole || req.user.targetRole);

  // Save to user profile
  const resumeEntry = {
    url: req.file.path,
    filename: req.file.originalname || 'resume.pdf',
    atsScore: analysis.atsScore,
    feedback: analysis.overallFeedback
  };

  await User.findByIdAndUpdate(req.user.id, {
    $push: { resumes: { $each: [resumeEntry], $slice: -5 } } // keep last 5
  });

  res.json({
    success: true,
    message: 'Resume analyzed successfully!',
    data: {
      resumeUrl: req.file.path,
      analysis
    }
  });
};

// @desc    Get user's resume history
// @route   GET /api/resume/history
// @access  Private
exports.getResumeHistory = async (req, res) => {
  const user = await User.findById(req.user.id).select('resumes');
  res.json({ success: true, data: user.resumes.reverse() });
};
