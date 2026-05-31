const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, targetRole } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  }

  const user = await User.create({ name, email, password, targetRole });
  const token = user.getSignedToken();

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetRole: user.targetRole,
      avatar: user.avatar,
      dsaStreak: user.dsaStreak,
      totalInterviews: user.totalInterviews,
      averageScore: user.averageScore
    }
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = user.getSignedToken();

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetRole: user.targetRole,
      avatar: user.avatar,
      dsaStreak: user.dsaStreak,
      totalInterviews: user.totalInterviews,
      averageScore: user.averageScore
    }
  });
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, bio, skills, targetRole } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, bio, skills, targetRole },
    { new: true, runValidators: true }
  );

  res.json({ success: true, message: 'Profile updated!', user });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully!' });
};
