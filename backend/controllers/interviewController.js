const Interview = require('../models/Interview');
const User = require('../models/User');
const { generateQuestions, evaluateAnswer, generateInterviewSummary } = require('../utils/gemini');

// @desc    Start new mock interview session
// @route   POST /api/interview/start
// @access  Private
exports.startInterview = async (req, res) => {
  const { jobRole, difficulty, type, questionCount } = req.body;

  if (!jobRole) {
    return res.status(400).json({ success: false, message: 'Job role is required.' });
  }

  const count = Math.min(parseInt(questionCount) || 5, 10);

  // Generate questions with AI
  const questionsData = await generateQuestions(jobRole, type || 'hr', difficulty || 'medium', count);

  const interview = await Interview.create({
    user: req.user.id,
    jobRole,
    difficulty: difficulty || 'medium',
    type: type || 'hr',
    questions: questionsData.map(q => ({
      question: q.question,
      userAnswer: '',
      aiFeedback: '',
      score: 0
    })),
    maxScore: count * 10,
    status: 'in-progress'
  });

  res.status(201).json({
    success: true,
    message: 'Interview session started!',
    data: {
      interviewId: interview._id,
      jobRole,
      type,
      difficulty,
      questions: questionsData, // includes tips for frontend display
      totalQuestions: count
    }
  });
};

// @desc    Submit an answer and get AI feedback
// @route   POST /api/interview/:id/answer
// @access  Private
exports.submitAnswer = async (req, res) => {
  const { questionIndex, answer } = req.body;

  const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview not found.' });
  }

  if (interview.status !== 'in-progress') {
    return res.status(400).json({ success: false, message: 'This interview is already completed.' });
  }

  const question = interview.questions[questionIndex];
  if (!question) {
    return res.status(400).json({ success: false, message: 'Question not found.' });
  }

  // Evaluate with AI
  const evaluation = await evaluateAnswer(question.question, answer, interview.jobRole);

  interview.questions[questionIndex].userAnswer = answer;
  interview.questions[questionIndex].aiFeedback = evaluation.feedback;
  interview.questions[questionIndex].score = evaluation.score;
  interview.questions[questionIndex].isCorrect = evaluation.score >= 6;
  await interview.save();

  res.json({
    success: true,
    message: 'Answer evaluated!',
    data: evaluation
  });
};

// @desc    Complete interview and get final summary
// @route   POST /api/interview/:id/complete
// @access  Private
exports.completeInterview = async (req, res) => {
  const { duration } = req.body;

  const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview not found.' });
  }

  // Calculate total score
  const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);

  // Generate AI summary
  const summary = await generateInterviewSummary(
    interview.jobRole,
    interview.questions,
    totalScore,
    interview.maxScore
  );

  interview.totalScore = totalScore;
  interview.aiSummary = summary.summary;
  interview.strengths = summary.strengths;
  interview.improvements = summary.improvements;
  interview.status = 'completed';
  interview.duration = duration || 0;
  interview.completedAt = new Date();
  await interview.save();

  // Update user stats
  const user = await User.findById(req.user.id);
  const newTotal = user.totalInterviews + 1;
  const newAvg = ((user.averageScore * user.totalInterviews) + interview.percentage) / newTotal;
  await User.findByIdAndUpdate(req.user.id, {
    totalInterviews: newTotal,
    averageScore: Math.round(newAvg)
  });

  res.json({
    success: true,
    message: 'Interview completed!',
    data: {
      interview,
      summary,
      totalScore,
      maxScore: interview.maxScore,
      percentage: interview.percentage
    }
  });
};

// @desc    Get user's interview history
// @route   GET /api/interview/history
// @access  Private
exports.getHistory = async (req, res) => {
  const interviews = await Interview.find({ user: req.user.id, status: 'completed' })
    .sort({ completedAt: -1 })
    .limit(20)
    .select('-questions');

  res.json({ success: true, count: interviews.length, data: interviews });
};

// @desc    Get single interview details
// @route   GET /api/interview/:id
// @access  Private
exports.getInterview = async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview not found.' });
  }
  res.json({ success: true, data: interview });
};
