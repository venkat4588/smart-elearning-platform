const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['mcq', 'msq', 'true-false', 'essay', 'fill-blank'],
      required: true
    },
    options: [String], // for mcq, msq, true-false
    correctAnswer: mongoose.Schema.Types.Mixed, // can be string, array, or boolean
    explanation: String,
    points: {
      type: Number,
      default: 1
    },
    timeLimit: Number, // in seconds
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [String]
  }],
  settings: {
    timeLimit: {
      type: Number, // total quiz time in minutes
      default: 30
    },
    passingScore: {
      type: Number, // percentage
      default: 70,
      min: 0,
      max: 100
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    shuffleOptions: {
      type: Boolean,
      default: true
    },
    showResults: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: false
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  attempts: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [{
      questionIndex: Number,
      selectedAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      points: Number,
      timeSpent: Number // in seconds
    }],
    score: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    timeSpent: Number, // total time in seconds
    attemptNumber: {
      type: Number,
      default: 1
    }
  }],
  // AI/ML metadata
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate totals when saving
quizSchema.pre('save', function(next) {
  this.totalQuestions = this.questions ? this.questions.length : 0;
  this.totalPoints = this.questions ? this.questions.reduce((sum, q) => sum + q.points, 0) : 0;
  next();
});

// Virtual for attempt count
quizSchema.virtual('attemptCount').get(function() {
  return this.attempts ? this.attempts.length : 0;
});

// Virtual for pass rate
quizSchema.virtual('passRate').get(function() {
  if (!this.attempts || this.attempts.length === 0) return 0;
  const passed = this.attempts.filter(attempt => attempt.passed).length;
  return Math.round((passed / this.attempts.length) * 100);
});

// Method to calculate average score
quizSchema.methods.calculateAverageScore = function() {
  if (!this.attempts || this.attempts.length === 0) {
    this.averageScore = 0;
    return;
  }
  const sum = this.attempts.reduce((acc, attempt) => acc + attempt.score, 0);
  this.averageScore = sum / this.attempts.length;
};

// Method to check if student can attempt quiz
quizSchema.methods.canStudentAttempt = function(studentId) {
  if (!this.attempts) return true;
  const studentAttempts = this.attempts.filter(attempt =>
    attempt.student.toString() === studentId.toString()
  );
  return studentAttempts.length < this.settings.maxAttempts;
};

// Method to get student's best attempt
quizSchema.methods.getStudentBestAttempt = function(studentId) {
  if (!this.attempts) return null;
  const studentAttempts = this.attempts.filter(attempt =>
    attempt.student.toString() === studentId.toString()
  );
  if (studentAttempts.length === 0) return null;
  return studentAttempts.reduce((best, current) =>
    current.score > best.score ? current : best
  );
};

module.exports = mongoose.model('Quiz', quizSchema);