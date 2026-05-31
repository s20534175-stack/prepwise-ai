const mongoose = require('mongoose');

const dsaProblemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemTitle: { type: String, required: true, trim: true },
  platform: {
    type: String,
    enum: ['LeetCode', 'HackerRank', 'Codeforces', 'GeeksForGeeks', 'CodeChef', 'Other'],
    default: 'LeetCode'
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  topic: {
    type: String,
    enum: ['Array', 'String', 'LinkedList', 'Tree', 'Graph', 'DP', 'Greedy',
           'Binary Search', 'Stack', 'Queue', 'Heap', 'Hashing', 'Math', 'Other'],
    required: true
  },
  timeSpent: { type: Number, default: 0 }, // in minutes
  notes: { type: String, default: '' },
  url: { type: String, default: '' },
  solvedAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 1 },
  isFavorite: { type: Boolean, default: false },
  needsRevision: { type: Boolean, default: false }
}, { timestamps: true });

// Index for fast user queries
dsaProblemSchema.index({ user: 1, solvedAt: -1 });
dsaProblemSchema.index({ user: 1, topic: 1 });

module.exports = mongoose.model('DSAProblem', dsaProblemSchema);
