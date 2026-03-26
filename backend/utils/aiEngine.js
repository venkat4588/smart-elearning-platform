const User = require('../models/User');
const Course = require('../models/Course');
const Result = require('../models/Result');

class AIRecommendationEngine {
  // Content-based filtering
  static async getContentBasedRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId);

      if (!user.interests || user.interests.length === 0) {
        return [];
      }

      // Get courses in user's interest categories
      const recommendedCourses = await Course.find({
        category: { $in: user.interests },
        isPublished: true
      })
      .populate('instructor', 'name')
      .sort({ averageRating: -1, totalStudents: -1 })
      .limit(limit);

      return recommendedCourses;
    } catch (error) {
      console.error('Error in content-based recommendations:', error);
      return [];
    }
  }

  // Collaborative filtering
  static async getCollaborativeRecommendations(userId, limit = 5) {
    try {
      const user = await User.findById(userId);
      const enrolledCourseIds = user.enrolledCourses.map(course => course.course);

      // Find users with similar interests
      const similarUsers = await User.find({
        interests: { $in: user.interests },
        _id: { $ne: userId }
      })
      .select('enrolledCourses')
      .limit(20);

      // Get courses that similar users have enrolled in
      const recommendedCourseIds = new Set();

      for (const similarUser of similarUsers) {
        for (const course of similarUser.enrolledCourses) {
          if (!enrolledCourseIds.includes(course.course)) {
            recommendedCourseIds.add(course.course.toString());
          }
        }
      }

      if (recommendedCourseIds.size === 0) {
        return [];
      }

      const recommendedCourses = await Course.find({
        _id: { $in: Array.from(recommendedCourseIds) },
        isPublished: true
      })
      .populate('instructor', 'name')
      .sort({ averageRating: -1 })
      .limit(limit);

      return recommendedCourses;
    } catch (error) {
      console.error('Error in collaborative recommendations:', error);
      return [];
    }
  }

  // Performance-based recommendations
  static async getPerformanceBasedRecommendations(userId, limit = 5) {
    try {
      // Get user's quiz results
      const quizResults = await Result.find({ student: userId })
        .populate('course', 'category level')
        .select('percentage course');

      if (quizResults.length === 0) {
        return [];
      }

      // Identify weak areas (courses with low scores)
      const weakCategories = new Set();
      const weakLevels = new Set();

      quizResults.forEach(result => {
        if (result.percentage < 70) {
          weakCategories.add(result.course.category);
          weakLevels.add(result.course.level);
        }
      });

      if (weakCategories.size === 0) {
        return [];
      }

      // Recommend courses in weak categories with appropriate difficulty
      const user = await User.findById(userId);
      const enrolledCourseIds = user.enrolledCourses.map(course => course.course);

      let recommendedLevel = 'beginner';
      if (weakLevels.has('intermediate') || weakLevels.has('advanced')) {
        recommendedLevel = 'intermediate';
      }

      const recommendedCourses = await Course.find({
        category: { $in: Array.from(weakCategories) },
        level: recommendedLevel,
        isPublished: true,
        _id: { $nin: enrolledCourseIds }
      })
      .populate('instructor', 'name')
      .sort({ averageRating: -1 })
      .limit(limit);

      return recommendedCourses;
    } catch (error) {
      console.error('Error in performance-based recommendations:', error);
      return [];
    }
  }

  // Popularity-based recommendations (fallback)
  static async getPopularRecommendations(userId, limit = 5) {
    try {
      const user = await User.findById(userId);
      const enrolledCourseIds = user.enrolledCourses.map(course => course.course);

      const popularCourses = await Course.find({
        isPublished: true,
        _id: { $nin: enrolledCourseIds }
      })
      .populate('instructor', 'name')
      .sort({ totalStudents: -1, averageRating: -1 })
      .limit(limit);

      return popularCourses;
    } catch (error) {
      console.error('Error in popular recommendations:', error);
      return [];
    }
  }

  // Get personalized quiz recommendations
  static async getQuizRecommendations(userId, limit = 5) {
    try {
      const user = await User.findById(userId);
      const completedQuizIds = user.quizResults.map(result => result.quiz);

      // Get weak topics from quiz results
      const quizResults = await Result.find({ student: userId })
        .populate('quiz', 'tags')
        .select('percentage weaknesses');

      const weakTopics = new Set();
      quizResults.forEach(result => {
        if (result.percentage < 70 && result.weaknesses) {
          result.weaknesses.forEach(topic => weakTopics.add(topic));
        }
      });

      if (weakTopics.size === 0) {
        return [];
      }

      // Find quizzes related to weak topics
      const Quiz = require('../models/Quiz');
      const recommendedQuizzes = await Quiz.find({
        tags: { $in: Array.from(weakTopics) },
        _id: { $nin: completedQuizIds },
        isPublished: true
      })
      .populate('course', 'title')
      .populate('instructor', 'name')
      .limit(limit);

      return recommendedQuizzes;
    } catch (error) {
      console.error('Error in quiz recommendations:', error);
      return [];
    }
  }

  // Analyze user learning patterns
  static async analyzeLearningPatterns(userId) {
    try {
      const user = await User.findById(userId);

      // Get quiz results over time
      const quizResults = await Result.find({ student: userId })
        .sort('createdAt')
        .select('percentage createdAt');

      // Calculate performance trend
      const performanceTrend = quizResults.map(result => ({
        date: result.createdAt,
        score: result.percentage
      }));

      // Calculate consistency (how regular the user takes quizzes)
      let consistency = 0;
      if (quizResults.length > 1) {
        const intervals = [];
        for (let i = 1; i < quizResults.length; i++) {
          const interval = quizResults[i].createdAt - quizResults[i-1].createdAt;
          intervals.push(interval);
        }

        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        // Lower standard deviation means more consistent
        consistency = Math.max(0, 100 - (stdDev / (1000 * 60 * 60 * 24))); // Normalize to 0-100
      }

      // Identify preferred learning times
      const learningTimes = quizResults.map(result => result.createdAt.getHours());
      const preferredTime = learningTimes.length > 0
        ? learningTimes.reduce((sum, hour) => sum + hour, 0) / learningTimes.length
        : 12;

      return {
        performanceTrend,
        consistency: Math.round(consistency),
        preferredLearningTime: Math.round(preferredTime),
        totalQuizzes: quizResults.length,
        averageScore: quizResults.length > 0
          ? Math.round(quizResults.reduce((sum, result) => sum + result.percentage, 0) / quizResults.length)
          : 0
      };
    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      return null;
    }
  }

  // Calculate course difficulty match for user
  static calculateDifficultyMatch(userLevel, courseDifficulty) {
    const levelMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const userNumLevel = levelMap[userLevel] || 1;
    const courseNumLevel = courseDifficulty;

    const difference = Math.abs(userNumLevel - courseNumLevel);
    return Math.max(0, 100 - (difference * 25)); // 0-100 match score
  }

  // Get comprehensive recommendations
  static async getComprehensiveRecommendations(userId) {
    try {
      const [
        contentBased,
        collaborative,
        performanceBased,
        popular,
        quizRecommendations,
        learningPatterns
      ] = await Promise.all([
        this.getContentBasedRecommendations(userId, 5),
        this.getCollaborativeRecommendations(userId, 3),
        this.getPerformanceBasedRecommendations(userId, 3),
        this.getPopularRecommendations(userId, 3),
        this.getQuizRecommendations(userId, 3),
        this.analyzeLearningPatterns(userId)
      ]);

      return {
        courses: {
          contentBased,
          collaborative,
          performanceBased,
          popular
        },
        quizzes: quizRecommendations,
        learningPatterns,
        totalRecommendations: contentBased.length + collaborative.length + performanceBased.length + popular.length + quizRecommendations.length
      };
    } catch (error) {
      console.error('Error getting comprehensive recommendations:', error);
      return {
        courses: { contentBased: [], collaborative: [], performanceBased: [], popular: [] },
        quizzes: [],
        learningPatterns: null,
        totalRecommendations: 0
      };
    }
  }
}

module.exports = AIRecommendationEngine;