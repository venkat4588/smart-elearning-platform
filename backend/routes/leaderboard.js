const express = require('express');
const User = require('../models/User');

const router = express.Router();

const { protect } = require('../middleware/auth');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type = 'points', limit = 10 } = req.query;

    let sortCriteria = {};
    const selectFields = 'name avatar points level streak enrolledCourses quizResults';

    switch (type) {
      case 'points':
        sortCriteria = { points: -1 };
        break;
      case 'level':
        sortCriteria = { level: -1, points: -1 };
        break;
      case 'streak':
        sortCriteria = { streak: -1 };
        break;
      default:
        sortCriteria = { points: -1 };
    }

    const leaderboard = await User.find({ role: 'student' })
      .select(selectFields)
      .sort(sortCriteria)
      .limit(parseInt(limit));

    const normalizedLeaderboard = leaderboard.map((user, index) => ({
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      },
      rank: index + 1,
      points: user.points || 0,
      level: user.level || 1,
      coursesCompleted: (user.enrolledCourses || []).filter(course => course.progress === 100).length,
      quizzesPassed: (user.quizResults || []).length,
      streak: user.streak || 0
    }));

    res.status(200).json({
      success: true,
      data: normalizedLeaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get user's rank
// @route   GET /api/leaderboard/rank
// @access  Private
router.get('/rank', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get rank based on points
    const higherPointsUsers = await User.countDocuments({
      role: 'student',
      points: { $gt: user.points }
    });

    const samePointsUsers = await User.countDocuments({
      role: 'student',
      points: user.points,
      _id: { $lt: user._id } // If same points, earlier created users rank higher
    });

    const rank = higherPointsUsers + samePointsUsers + 1;
    const currentLevelBase = Math.max(0, (user.level - 1) * 500);
    const nextLevelPoints = user.level * 500;
    const progressToNext = nextLevelPoints === currentLevelBase
      ? 100
      : Math.round(((user.points - currentLevelBase) / (nextLevelPoints - currentLevelBase)) * 100);

    res.status(200).json({
      success: true,
      data: {
        rank,
        points: user.points,
        level: user.level,
        nextLevelPoints,
        progressToNext: Math.max(0, Math.min(progressToNext, 100))
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
