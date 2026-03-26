const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

const router = express.Router();

const { protect } = require('../middleware/auth');

// @desc    Get personalized course recommendations
// @route   GET /api/recommendations/courses
// @access  Private
router.get('/courses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get user's enrolled courses
    const enrolledCourseIds = new Set(
      user.enrolledCourses.map(course => course.course.toString())
    );

    // Get user's quiz results for performance analysis
    const quizResults = await Result.find({ student: req.user.id })
      .populate('quiz', 'course')
      .select('percentage quiz course');

    // Content-based filtering: Recommend courses in user's interest categories
    let recommendedCourses = [];

    if (user.interests && user.interests.length > 0) {
      recommendedCourses = await Course.find({
        category: { $in: user.interests },
        isPublished: true,
        _id: { $nin: Array.from(enrolledCourseIds) }
      })
      .populate('instructor', 'name')
      .limit(10);
    }

    // Collaborative filtering: Recommend courses taken by similar users
    const similarUsers = await User.find({
      interests: { $in: user.interests },
      _id: { $ne: req.user.id }
    })
    .select('enrolledCourses')
    .limit(10);

    const similarUserCourseIds = new Set();
    similarUsers.forEach(similarUser => {
      similarUser.enrolledCourses.forEach(course => {
        const courseId = course.course.toString();
        if (!enrolledCourseIds.has(courseId)) {
          similarUserCourseIds.add(courseId);
        }
      });
    });

    const collaborativeCourses = await Course.find({
      _id: { $in: Array.from(similarUserCourseIds) },
      isPublished: true
    })
    .populate('instructor', 'name')
    .limit(5);

    // Performance-based recommendations: Recommend courses based on quiz performance
    let performanceBasedCourses = [];
    if (quizResults.length > 0) {
      const weakCategories = [];
      const strongCategories = [];

      // Analyze quiz performance by category
      for (const result of quizResults) {
        const course = await Course.findById(result.course);
        if (result.percentage < 70) {
          if (!weakCategories.includes(course.category)) {
            weakCategories.push(course.category);
          }
        } else {
          if (!strongCategories.includes(course.category)) {
            strongCategories.push(course.category);
          }
        }
      }

      // Recommend easier courses in weak categories
      if (weakCategories.length > 0) {
        performanceBasedCourses = await Course.find({
          category: { $in: weakCategories },
          level: 'beginner',
          isPublished: true,
          _id: { $nin: Array.from(enrolledCourseIds) }
        })
        .populate('instructor', 'name')
        .limit(5);
      }
    }

    // Popularity-based recommendations as fallback
    const popularCourses = await Course.find({
      isPublished: true,
      _id: { $nin: Array.from(enrolledCourseIds) }
    })
    .populate('instructor', 'name')
    .sort({ totalStudents: -1, averageRating: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      data: {
        contentBased: recommendedCourses,
        collaborative: collaborativeCourses,
        performanceBased: performanceBasedCourses,
        popular: popularCourses,
        totalRecommendations: recommendedCourses.length + collaborativeCourses.length + performanceBasedCourses.length + popularCourses.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get quiz recommendations
// @route   GET /api/recommendations/quizzes
// @access  Private
router.get('/quizzes', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get user's completed quiz IDs
    const completedQuizIds = user.quizResults.map(result => result.quiz);

    // Get user's weak areas from quiz results
    const quizResults = await Result.find({ student: req.user.id })
      .populate('quiz', 'title course difficulty tags')
      .select('percentage weaknesses quiz');

    const weakTopics = [];
    quizResults.forEach(result => {
      if (result.percentage < 70 && result.weaknesses) {
        weakTopics.push(...result.weaknesses);
      }
    });

    // Find quizzes related to weak topics
    let recommendedQuizzes = [];
    if (weakTopics.length > 0) {
      recommendedQuizzes = await Quiz.find({
        tags: { $in: weakTopics },
        _id: { $nin: completedQuizIds },
        isPublished: true
      })
      .populate('course', 'title')
      .populate('instructor', 'name')
      .limit(5);
    }

    // Recommend quizzes from enrolled courses that haven't been taken
    const enrolledCourseIds = user.enrolledCourses.map(course => course.course);
    const courseQuizzes = await Quiz.find({
      course: { $in: enrolledCourseIds },
      _id: { $nin: completedQuizIds },
      isPublished: true
    })
    .populate('course', 'title')
    .populate('instructor', 'name')
    .limit(5);

    res.status(200).json({
      success: true,
      data: {
        revisionQuizzes: recommendedQuizzes,
        courseQuizzes: courseQuizzes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get topic recommendations
// @route   GET /api/recommendations/topics
// @access  Private
router.get('/topics', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Analyze user's performance to identify weak and strong topics
    const quizResults = await Result.find({ student: req.user.id })
      .populate('quiz', 'tags difficulty')
      .select('percentage weaknesses strengths');

    const topicPerformance = {};

    quizResults.forEach(result => {
      if (result.quiz.tags) {
        result.quiz.tags.forEach(tag => {
          if (!topicPerformance[tag]) {
            topicPerformance[tag] = {
              totalScore: 0,
              attempts: 0,
              averageScore: 0
            };
          }
          topicPerformance[tag].totalScore += result.percentage;
          topicPerformance[tag].attempts += 1;
        });
      }
    });

    // Calculate average scores for each topic
    Object.keys(topicPerformance).forEach(topic => {
      topicPerformance[topic].averageScore = topicPerformance[topic].totalScore / topicPerformance[topic].attempts;
    });

    // Identify weak and strong topics
    const weakTopics = Object.keys(topicPerformance).filter(
      topic => topicPerformance[topic].averageScore < 70
    );

    const strongTopics = Object.keys(topicPerformance).filter(
      topic => topicPerformance[topic].averageScore >= 80
    );

    // Recommend next topics based on current level
    let nextTopics = [];
    if (user.preferredDifficulty === 'beginner') {
      nextTopics = ['javascript-basics', 'html-css', 'python-intro'];
    } else if (user.preferredDifficulty === 'intermediate') {
      nextTopics = ['react', 'node-js', 'database-design'];
    } else {
      nextTopics = ['advanced-algorithms', 'machine-learning', 'system-design'];
    }

    res.status(200).json({
      success: true,
      data: {
        weakTopics,
        strongTopics,
        nextTopics,
        topicPerformance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update user preferences for better recommendations
// @route   PUT /api/recommendations/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { interests, learningStyle, preferredDifficulty } = req.body;

    const updates = {};
    if (interests !== undefined) {
      updates.interests = interests;
    }
    if (learningStyle !== undefined) {
      updates.learningStyle = learningStyle;
    }
    if (preferredDifficulty !== undefined) {
      updates.preferredDifficulty = preferredDifficulty;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        interests: user.interests,
        learningStyle: user.learningStyle,
        preferredDifficulty: user.preferredDifficulty
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
