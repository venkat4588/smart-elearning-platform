const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a lesson description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add lesson duration']
  },
  order: {
    type: Number,
    required: [true, 'Please add lesson order']
  },
  resources: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'ppt', 'link', 'image', 'video', 'other'],
      default: 'other'
    },
    size: Number // in bytes
  }],
  transcript: {
    type: String,
    maxlength: [10000, 'Transcript cannot be more than 10000 characters']
  },
  keyPoints: [String],
  prerequisites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  }],
  isPreview: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    comment: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // AI/ML metadata
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  tags: [String],
  estimatedReadTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
lessonSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
lessonSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Index for search
lessonSchema.index({ title: 'text', description: 'text', keyPoints: 'text', tags: 'text' });

module.exports = mongoose.model('Lesson', lessonSchema);