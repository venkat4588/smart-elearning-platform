const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const Course = require('../models/Course');
const User = require('../models/User');

const normalizeAnswerValue = (value) => {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  if (typeof value === 'boolean') {
    return value.toString();
  }

  return value;
};

const areAnswersEqual = (questionType, userAnswer, correctAnswer) => {
  if (questionType === 'msq') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }

    const normalizedUserAnswer = userAnswer
      .map(answer => normalizeAnswerValue(answer))
      .sort();
    const normalizedCorrectAnswer = correctAnswer
      .map(answer => normalizeAnswerValue(answer))
      .sort();

    return JSON.stringify(normalizedUserAnswer) === JSON.stringify(normalizedCorrectAnswer);
  }

  return normalizeAnswerValue(userAnswer) === normalizeAnswerValue(correctAnswer);
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Quiz.find(JSON.parse(queryStr)).populate('course', 'title').populate('instructor', 'name');

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Quiz.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const quizzes = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: quizzes.length,
      pagination,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title description')
      .populate('instructor', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user can access this quiz
    const course = await Course.findById(quiz.course);
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === req.user.id
    );

    if (!isEnrolled && req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this quiz'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private (Instructor only)
exports.createQuiz = async (req, res) => {
  try {
    // Add user to req.body
    req.body.instructor = req.user.id;

    const quiz = await Quiz.create(req.body);

    // Add quiz to course
    await Course.findByIdAndUpdate(req.body.course, {
      $push: { quizzes: quiz._id }
    });

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor only)
exports.updateQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Make sure user is quiz instructor
    if (quiz.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this quiz'
      });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor only)
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Make sure user is quiz instructor
    if (quiz.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    // Remove quiz from course
    await Course.findByIdAndUpdate(quiz.course, {
      $pull: { quizzes: quiz._id }
    });

    await Quiz.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/attempt
// @access  Private
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if student can attempt
    if (!quiz.canStudentAttempt(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const processedAnswers = [];
    const normalizedAnswers = Array.isArray(answers)
      ? answers
      : quiz.questions.map((question, index) => {
          if (!answers || typeof answers !== 'object') {
            return null;
          }

          const questionId = question._id.toString();

          if (Object.prototype.hasOwnProperty.call(answers, questionId)) {
            return answers[questionId];
          }

          return answers[index] ?? null;
        });
    const questionTimeSpent = Array.isArray(timeSpent)
      ? timeSpent
      : quiz.questions.map(() => 0);
    const totalTimeSpent = Array.isArray(timeSpent)
      ? timeSpent.reduce((sum, current) => sum + (Number(current) || 0), 0)
      : Number(timeSpent) || 0;

    quiz.questions.forEach((question, index) => {
      const userAnswer = normalizedAnswers[index];
      let isCorrect = false;
      let points = 0;

      if (question.type === 'mcq' || question.type === 'true-false' || question.type === 'msq' || question.type === 'fill-blank') {
        isCorrect = areAnswersEqual(question.type, userAnswer, question.correctAnswer);
      } else if (question.type === 'essay') {
        // For essay questions, manual grading would be needed
        // For now, we'll assume they need manual review
        isCorrect = false;
      }

      if (isCorrect) {
        correctAnswers++;
        points = question.points;
        totalPoints += points;
      }

      processedAnswers.push({
        questionIndex: index,
        selectedAnswer: userAnswer,
        isCorrect,
        points,
        timeSpent: questionTimeSpent[index] || 0
      });
    });

    const percentage = (totalPoints / quiz.totalPoints) * 100;
    const passed = percentage >= quiz.settings.passingScore;

    // Get attempt number
    const studentAttempts = quiz.attempts.filter(
      attempt => attempt.student.toString() === req.user.id
    );
    const attemptNumber = studentAttempts.length + 1;

    // Add attempt to quiz
    quiz.attempts.push({
      student: req.user.id,
      answers: processedAnswers,
      score: totalPoints,
      percentage,
      passed,
      startedAt: new Date(Date.now() - (totalTimeSpent * 1000)),
      completedAt: new Date(),
      timeSpent: totalTimeSpent,
      attemptNumber
    });

    // Update average score
    quiz.calculateAverageScore();
    await quiz.save();

    // Create result record
    const result = new Result({
      student: req.user.id,
      quiz: quiz._id,
      course: quiz.course,
      score: totalPoints,
      totalQuestions: quiz.totalQuestions,
      correctAnswers,
      percentage,
      grade: '',
      passed,
      answers: processedAnswers.map(answer => ({
        question: quiz.questions[answer.questionIndex].question,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: quiz.questions[answer.questionIndex].correctAnswer,
        isCorrect: answer.isCorrect,
        points: answer.points,
        timeSpent: answer.timeSpent
      })),
      startedAt: new Date(Date.now() - (totalTimeSpent * 1000)),
      completedAt: new Date(),
      timeSpent: totalTimeSpent,
      attemptNumber
    });

    // Calculate grade and generate feedback
    result.calculateGrade();
    result.generateFeedback();
    result.analyzePerformance();
    await result.save();

    // Update user quiz results
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        quizResults: {
          quiz: quiz._id,
          score: totalPoints,
          totalQuestions: quiz.totalQuestions,
          attemptedAt: new Date()
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        result,
        passed,
        score: totalPoints,
        percentage,
        grade: result.grade
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get quiz results for student
// @route   GET /api/quizzes/:id/results
// @access  Private
exports.getQuizResults = async (req, res) => {
  try {
    const results = await Result.find({
      quiz: req.params.id,
      student: req.user.id
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get quiz attempts for instructor
// @route   GET /api/quizzes/:id/attempts
// @access  Private (Instructor only)
exports.getQuizAttempts = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('attempts.student', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Make sure user is quiz instructor
    if (quiz.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view attempts'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz.attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
