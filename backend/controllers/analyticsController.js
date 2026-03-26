const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// @desc    Get user analytics
// @route   GET /api/analytics/user
// @access  Private
exports.getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get enrolled courses count
    const enrolledCoursesCount = user.enrolledCourses.length;

    // Get completed courses count
    const completedCoursesCount = user.enrolledCourses.filter(
      course => course.progress === 100
    ).length;

    // Get average quiz score
    const quizResults = user.quizResults;
    const averageQuizScore = quizResults.length > 0
      ? quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length
      : 0;

    // Get total points earned
    const totalPoints = user.points;

    // Get current level
    const currentLevel = user.level;

    // Get learning streak
    const streak = user.streak;

    // Get badges earned
    const badgesCount = user.badges.length;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentQuizResults = quizResults.filter(
      result => result.attemptedAt > thirtyDaysAgo
    );

    // Get course progress over time
    const courseProgress = user.enrolledCourses.map(course => ({
      courseId: course.course,
      progress: course.progress,
      enrolledAt: course.enrolledAt
    }));

    res.status(200).json({
      success: true,
      data: {
        enrolledCoursesCount,
        completedCoursesCount,
        averageQuizScore: Math.round(averageQuizScore),
        totalPoints,
        currentLevel,
        streak,
        badgesCount,
        recentActivity: {
          quizzesTaken: recentQuizResults.length,
          averageScore: recentQuizResults.length > 0
            ? Math.round(recentQuizResults.reduce((sum, result) => sum + result.score, 0) / recentQuizResults.length)
            : 0
        },
        courseProgress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get course analytics (for instructors)
// @route   GET /api/analytics/courses/:courseId
// @access  Private (Instructor only)
exports.getCourseAnalytics = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this course analytics'
      });
    }

    // Get enrollment statistics
    const totalEnrollments = course.enrolledStudents.length;
    const completedStudents = course.enrolledStudents.filter(
      student => student.completedAt
    ).length;
    const completionRate = totalEnrollments > 0 ? (completedStudents / totalEnrollments) * 100 : 0;

    // Get average rating
    const averageRating = course.averageRating;

    // Get enrollment over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEnrollments = course.enrolledStudents.filter(
      student => student.enrolledAt > thirtyDaysAgo
    ).length;

    // Get quiz performance for this course
    const courseQuizzes = await Quiz.find({ course: req.params.courseId });
    const quizIds = courseQuizzes.map(quiz => quiz._id);

    const quizResults = await Result.find({
      quiz: { $in: quizIds }
    });

    const averageQuizScore = quizResults.length > 0
      ? quizResults.reduce((sum, result) => sum + result.percentage, 0) / quizResults.length
      : 0;

    // Get student engagement metrics
    const totalViews = course.lessons.reduce((sum, lesson) => sum + (lesson.views || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalEnrollments,
        completedStudents,
        completionRate: Math.round(completionRate),
        averageRating: Math.round(averageRating * 10) / 10,
        recentEnrollments,
        quizPerformance: {
          totalQuizzes: courseQuizzes.length,
          averageScore: Math.round(averageQuizScore),
          totalAttempts: quizResults.length
        },
        engagement: {
          totalViews,
          averageViewsPerLesson: course.lessons.length > 0 ? Math.round(totalViews / course.lessons.length) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get quiz analytics
// @route   GET /api/analytics/quizzes/:quizId
// @access  Private (Instructor only)
exports.getQuizAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is the instructor
    if (quiz.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this quiz analytics'
      });
    }

    // Get attempt statistics
    const totalAttempts = quiz.attempts.length;
    const passedAttempts = quiz.attempts.filter(attempt => attempt.passed).length;
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

    // Get average score
    const averageScore = quiz.averageScore;

    // Get question-wise performance
    const questionStats = quiz.questions.map((question, index) => {
      const questionAttempts = quiz.attempts.map(attempt => attempt.answers[index]);
      const correctAnswers = questionAttempts.filter(answer => answer && answer.isCorrect).length;
      const accuracy = questionAttempts.length > 0 ? (correctAnswers / questionAttempts.length) * 100 : 0;

      return {
        questionIndex: index,
        question: question.question,
        type: question.type,
        correctAnswers,
        totalAttempts: questionAttempts.length,
        accuracy: Math.round(accuracy)
      };
    });

    // Get score distribution
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    quiz.attempts.forEach(attempt => {
      const score = attempt.percentage;
      if (score <= 20) scoreRanges['0-20']++;
      else if (score <= 40) scoreRanges['21-40']++;
      else if (score <= 60) scoreRanges['41-60']++;
      else if (score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        passedAttempts,
        passRate: Math.round(passRate),
        averageScore: Math.round(averageScore),
        questionStats,
        scoreDistribution: scoreRanges
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get platform-wide analytics (Admin only)
// @route   GET /api/analytics/platform
// @access  Private (Admin only)
exports.getPlatformAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view platform analytics'
      });
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });

    // Get course statistics
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Course.aggregate([
      { $unwind: '$enrolledStudents' },
      { $count: 'total' }
    ]);

    // Get quiz statistics
    const totalQuizzes = await Quiz.countDocuments();
    const totalQuizAttempts = await Result.countDocuments();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentEnrollments = await Course.aggregate([
      { $unwind: '$enrolledStudents' },
      { $match: { 'enrolledStudents.enrolledAt': { $gte: sevenDaysAgo } } },
      { $count: 'total' }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          instructors: totalInstructors,
          recent: recentUsers
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          totalEnrollments: totalEnrollments[0]?.total || 0,
          recentEnrollments: recentEnrollments[0]?.total || 0
        },
        quizzes: {
          total: totalQuizzes,
          totalAttempts: totalQuizAttempts
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get learning insights for user
// @route   GET /api/analytics/insights
// @access  Private
exports.getLearningInsights = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get user's quiz performance trends
    const quizResults = await Result.find({ student: req.user.id })
      .sort('createdAt')
      .limit(20);

    const performanceTrend = quizResults.map(result => ({
      date: result.createdAt,
      score: result.percentage,
      quiz: result.quiz
    }));

    // Get recommended courses based on interests and performance
    let recommendedCourses = [];

    if (user.interests && user.interests.length > 0) {
      recommendedCourses = await Course.find({
        category: { $in: user.interests },
        isPublished: true
      })
      .populate('instructor', 'name')
      .limit(5);
    }

    // Get weak areas based on quiz results
    const weakAreas = [];
    // This would require more complex analysis of quiz results
    // For now, return placeholder

    // Get learning streak and consistency
    const streak = user.streak;
    const lastActive = user.lastActive;

    res.status(200).json({
      success: true,
      data: {
        performanceTrend,
        recommendedCourses,
        weakAreas,
        streak,
        lastActive,
        insights: {
          consistency: streak > 5 ? 'Excellent' : streak > 2 ? 'Good' : 'Needs improvement',
          recommendation: recommendedCourses.length > 0 ? 'Based on your interests' : 'Complete profile for better recommendations'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};