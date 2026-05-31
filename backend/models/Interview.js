const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userAnswer: { type: String, default: '' },
  aiFeedback: { type: String, default: '' },
  score: { type: Number, default: 0 }, // 0-10
  isCorrect: { type: Boolean, default: false }
});

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobRole: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  type: { type: String, enum: ['hr', 'technical', 'behavioral', 'mixed'], default: 'hr' },
  questions: [questionSchema],
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  aiSummary: { type: String, default: '' },
  strengths: [String],
  improvements: [String],
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  duration: { type: Number, default: 0 }, // in seconds
  completedAt: { type: Date }
}, { timestamps: true });

// Calculate percentage before save
interviewSchema.pre('save', function(next) {
  if (this.maxScore > 0) {
    this.percentage = Math.round((this.totalScore / this.maxScore) * 100);
  }
  next();
});

module.exports = mongoose.model('Interview', interviewSchema);
