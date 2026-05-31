const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Interview = require('../models/Interview');
const DSAProblem = require('../models/DSAProblem');

// All admin routes are protected + admin only
router.use(protect, adminOnly);

// @desc    Get platform stats
// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [totalUsers, totalInterviews, totalDSA, newUsersToday] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Interview.countDocuments({ status: 'completed' }),
    DSAProblem.countDocuments(),
    User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } })
  ]);

  const avgScore = await Interview.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, avg: { $avg: '$percentage' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalInterviews,
      totalDSA,
      newUsersToday,
      avgInterviewScore: Math.round(avgScore[0]?.avg || 0)
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = search ? { $or: [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ]} : {};

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);
  res.json({ success: true, total, data: users });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
});

module.exports = router;
