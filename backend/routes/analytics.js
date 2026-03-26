const express = require('express');
const {
  getUserAnalytics,
  getCourseAnalytics,
  getQuizAnalytics,
  getPlatformAnalytics,
  getLearningInsights
} = require('../controllers/analyticsController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/user', protect, getUserAnalytics);
router.get('/courses/:courseId', protect, getCourseAnalytics);
router.get('/quizzes/:quizId', protect, getQuizAnalytics);
router.get('/platform', protect, getPlatformAnalytics);
router.get('/insights', protect, getLearningInsights);

module.exports = router;