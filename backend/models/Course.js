const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a course description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['programming', 'design', 'business', 'marketing', 'data-science', 'other']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  price: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  lessons: [{
    title: String,
    description: String,
    videoUrl: String,
    duration: Number, // in minutes
    order: Number,
    resources: [{
      name: String,
      url: String,
      type: String // pdf, doc, link, etc.
    }]
  }],
  quizzes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz'
  }],
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedAt: Date
  }],
  reviews: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  prerequisites: [String],
  learningObjectives: [String],
  duration: {
    type: Number, // total duration in hours
    default: 0
  },
  language: {
    type: String,
    default: 'English'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  // AI/ML metadata for recommendations
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  popularity: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate average rating when reviews are added/updated
courseSchema.methods.calculateAverageRating = function() {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
  } else {
    this.averageRating = 0;
  }
};

// Update total students count
courseSchema.methods.updateTotalStudents = function() {
  this.totalStudents = this.enrolledStudents ? this.enrolledStudents.length : 0;
};

// Update total lessons count
courseSchema.methods.updateTotalLessons = function() {
  this.totalLessons = this.lessons ? this.lessons.length : 0;
};

// Virtual for course completion percentage
courseSchema.virtual('completionPercentage').get(function() {
  if (!this.enrolledStudents || this.enrolledStudents.length === 0) return 0;
  const completedCount = this.enrolledStudents.filter(student => student.completedAt).length;
  return Math.round((completedCount / this.enrolledStudents.length) * 100);
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);