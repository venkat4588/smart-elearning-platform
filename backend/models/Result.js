const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: [{
    question: {
      type: String,
      required: true
    },
    selectedAnswer: mongoose.Schema.Types.Mixed,
    correctAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: {
      type: Boolean,
      required: true
    },
    points: {
      type: Number,
      default: 0
    },
    timeSpent: Number // in seconds
  }],
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  // Performance analytics
  strengths: [String],
  weaknesses: [String],
  recommendedTopics: [String],
  improvementAreas: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time spent in minutes
resultSchema.virtual('timeSpentMinutes').get(function() {
  return Math.round(this.timeSpent / 60);
});

// Method to calculate grade based on percentage
resultSchema.methods.calculateGrade = function() {
  const percentage = this.percentage;
  if (percentage >= 95) this.grade = 'A+';
  else if (percentage >= 90) this.grade = 'A';
  else if (percentage >= 85) this.grade = 'B+';
  else if (percentage >= 80) this.grade = 'B';
  else if (percentage >= 75) this.grade = 'C+';
  else if (percentage >= 70) this.grade = 'C';
  else if (percentage >= 60) this.grade = 'D';
  else this.grade = 'F';
};

// Method to generate performance feedback
resultSchema.methods.generateFeedback = function() {
  const percentage = this.percentage;
  let feedback = '';

  if (percentage >= 90) {
    feedback = 'Excellent performance! You have a strong understanding of the material.';
  } else if (percentage >= 80) {
    feedback = 'Good job! You performed well, but there\'s room for improvement in some areas.';
  } else if (percentage >= 70) {
    feedback = 'Satisfactory performance. Consider reviewing the material you found challenging.';
  } else if (percentage >= 60) {
    feedback = 'You passed, but you should focus on strengthening your understanding of key concepts.';
  } else {
    feedback = 'You need to review the material thoroughly and consider retaking the quiz.';
  }

  this.feedback = feedback;
};

// Method to identify strengths and weaknesses
resultSchema.methods.analyzePerformance = function() {
  const correctTopics = [];
  const incorrectTopics = [];

  this.answers.forEach(answer => {
    // This would require question tags/topics to be implemented
    // For now, we'll use placeholder logic
    if (answer.isCorrect) {
      correctTopics.push('Topic area');
    } else {
      incorrectTopics.push('Topic area');
    }
  });

  this.strengths = [...new Set(correctTopics)];
  this.weaknesses = [...new Set(incorrectTopics)];
  this.improvementAreas = this.weaknesses;
};

// Index for efficient queries
resultSchema.index({ student: 1, quiz: 1 });
resultSchema.index({ course: 1, student: 1 });
resultSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Result', resultSchema);