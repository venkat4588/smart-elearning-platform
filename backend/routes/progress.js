const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

const { protect } = require('../middleware/auth');

// @desc    Get user progress
// @route   GET /api/progress
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses.course', 'title description thumbnail category level duration lessons')
      .select('enrolledCourses');

    res.status(200).json({
      success: true,
      data: user.enrolledCourses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update course progress
// @route   PUT /api/progress/:courseId
// @access  Private
router.put('/:courseId', protect, async (req, res) => {
  try {
    const { progress, completedLessons } = req.body;

    const user = await User.findById(req.user.id);

    // Find the enrolled course
    const enrolledCourse = user.enrolledCourses.find(
      course => course.course.toString() === req.params.courseId
    );

    if (!enrolledCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found in enrolled courses'
      });
    }

    // Update progress
    if (progress !== undefined) {
      enrolledCourse.progress = progress;
    }

    // Update completed lessons
    if (completedLessons) {
      completedLessons.forEach(lessonId => {
        if (!enrolledCourse.completedLessons.some(lesson => lesson.lesson.toString() === lessonId)) {
          enrolledCourse.completedLessons.push({
            lesson: lessonId,
            completedAt: new Date()
          });
        }
      });
    }

    // Check if course is completed
    if (progress === 100 && !enrolledCourse.completedAt) {
      enrolledCourse.completedAt = new Date();

      // Award points for course completion
      user.points += 100;
      user.level = Math.floor(user.points / 500) + 1;

      // Check for badges
      const completedCourses = user.enrolledCourses.filter(course => course.completedAt).length;
      if (completedCourses === 1) {
        user.badges.push({
          name: 'First Course Completed',
          description: 'Completed your first course',
          earnedAt: new Date()
        });
      } else if (completedCourses === 5) {
        user.badges.push({
          name: 'Learning Enthusiast',
          description: 'Completed 5 courses',
          earnedAt: new Date()
        });
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: enrolledCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get course progress details
// @route   GET /api/progress/:courseId
// @access  Private
router.get('/:courseId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses.course')
      .select('enrolledCourses');

    const enrolledCourse = user.enrolledCourses.find(
      course => course.course.toString() === req.params.courseId
    );

    if (!enrolledCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found in enrolled courses'
      });
    }

    // Get course details with lessons
    const course = await Course.findById(req.params.courseId)
      .select('title lessons');

    // Calculate detailed progress
    const totalLessons = course.lessons.length;
    const completedLessonsCount = enrolledCourse.completedLessons.length;
    const progressPercentage = enrolledCourse.progress;

    // Get next lesson to complete
    const completedLessonIds = enrolledCourse.completedLessons.map(lesson => lesson.lesson.toString());
    const nextLesson = course.lessons.find(lesson => !completedLessonIds.includes(lesson._id.toString()));

    res.status(200).json({
      success: true,
      data: {
        course: course.title,
        progress: progressPercentage,
        totalLessons,
        completedLessonsCount,
        nextLesson: nextLesson ? {
          id: nextLesson._id,
          title: nextLesson.title,
          order: nextLesson.order
        } : null,
        completedLessons: enrolledCourse.completedLessons
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Mark lesson as completed
// @route   POST /api/progress/:courseId/lessons/:lessonId
// @access  Private
router.post('/:courseId/lessons/:lessonId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const enrolledCourse = user.enrolledCourses.find(
      course => course.course.toString() === req.params.courseId
    );

    if (!enrolledCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found in enrolled courses'
      });
    }

    // Check if lesson is already completed
    const lessonExists = enrolledCourse.completedLessons.some(
      lesson => lesson.lesson.toString() === req.params.lessonId
    );

    if (lessonExists) {
      return res.status(400).json({
        success: false,
        message: 'Lesson already completed'
      });
    }

    // Add lesson to completed lessons
    enrolledCourse.completedLessons.push({
      lesson: req.params.lessonId,
      completedAt: new Date()
    });

    // Update progress
    const course = await Course.findById(req.params.courseId);
    if (!course || course.lessons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course lessons not found'
      });
    }

    const progressIncrement = (1 / course.lessons.length) * 100;
    enrolledCourse.progress = Math.min(100, enrolledCourse.progress + progressIncrement);

    // Award points for lesson completion
    user.points += 10;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = new Date(user.lastActive);
    lastActive.setHours(0, 0, 0, 0);

    if (lastActive.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      user.streak += 1;
    } else if (lastActive.getTime() < today.getTime() - 24 * 60 * 60 * 1000) {
      user.streak = 1;
    }

    user.lastActive = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        lessonId: req.params.lessonId,
        progress: enrolledCourse.progress,
        completedLessons: enrolledCourse.completedLessons,
        points: user.points,
        streak: user.streak
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
