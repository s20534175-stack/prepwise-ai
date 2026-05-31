const DSAProblem = require('../models/DSAProblem');
const User = require('../models/User');

// @desc    Log a solved problem
// @route   POST /api/dsa/log
// @access  Private
exports.logProblem = async (req, res) => {
  const { problemTitle, platform, difficulty, topic, timeSpent, notes, url } = req.body;

  if (!problemTitle || !difficulty || !topic) {
    return res.status(400).json({ success: false, message: 'Title, difficulty, and topic are required.' });
  }

  const problem = await DSAProblem.create({
    user: req.user.id,
    problemTitle,
    platform: platform || 'LeetCode',
    difficulty,
    topic,
    timeSpent: timeSpent || 0,
    notes: notes || '',
    url: url || ''
  });

  // Update user streak
  await updateStreak(req.user.id);

  res.status(201).json({
    success: true,
    message: `"${problemTitle}" logged successfully! 🎉`,
    data: problem
  });
};

// Helper: update DSA streak
async function updateStreak(userId) {
  const user = await User.findById(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = user.lastDsaDate ? new Date(user.lastDsaDate) : null;
  if (lastDate) lastDate.setHours(0, 0, 0, 0);

  let newStreak = user.dsaStreak;
  if (!lastDate) {
    newStreak = 1;
  } else {
    const diff = (today - lastDate) / (1000 * 60 * 60 * 24);
    if (diff === 0) {
      // Same day - no streak change
    } else if (diff === 1) {
      newStreak += 1; // Consecutive day
    } else {
      newStreak = 1; // Streak broken
    }
  }

  await User.findByIdAndUpdate(userId, {
    dsaStreak: newStreak,
    lastDsaDate: new Date(),
    $inc: { totalDsaSolved: 1 }
  });
}

// @desc    Get all problems with filters
// @route   GET /api/dsa/problems
// @access  Private
exports.getProblems = async (req, res) => {
  const { topic, difficulty, platform, limit = 20, page = 1 } = req.query;

  const query = { user: req.user.id };
  if (topic) query.topic = topic;
  if (difficulty) query.difficulty = difficulty;
  if (platform) query.platform = platform;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [problems, total] = await Promise.all([
    DSAProblem.find(query).sort({ solvedAt: -1 }).skip(skip).limit(parseInt(limit)),
    DSAProblem.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: problems.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    data: problems
  });
};

// @desc    Get dashboard analytics
// @route   GET /api/dsa/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  const userId = req.user.id;

  const [
    totalSolved,
    byDifficulty,
    byTopic,
    recentProblems,
    user
  ] = await Promise.all([
    DSAProblem.countDocuments({ user: userId }),
    DSAProblem.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]),
    DSAProblem.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]),
    DSAProblem.find({ user: userId }).sort({ solvedAt: -1 }).limit(5),
    User.findById(userId).select('dsaStreak totalDsaSolved lastDsaDate')
  ]);

  // Problems in last 7 days (for activity chart)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyActivity = await DSAProblem.aggregate([
    { $match: { user: userId, solvedAt: { $gte: sevenDaysAgo } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$solvedAt' } },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalSolved,
      streak: user.dsaStreak,
      byDifficulty,
      byTopic,
      recentProblems,
      weeklyActivity
    }
  });
};

// @desc    Delete a problem
// @route   DELETE /api/dsa/:id
// @access  Private
exports.deleteProblem = async (req, res) => {
  const problem = await DSAProblem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!problem) {
    return res.status(404).json({ success: false, message: 'Problem not found.' });
  }
  await User.findByIdAndUpdate(req.user.id, { $inc: { totalDsaSolved: -1 } });
  res.json({ success: true, message: 'Problem removed.' });
};
