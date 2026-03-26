const express = require('express');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizResults,
  getQuizAttempts
} = require('../controllers/quizController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, createQuiz);

router.route('/:id')
  .get(protect, getQuiz)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

router.post('/:id/attempt', protect, submitQuizAttempt);
router.get('/:id/results', protect, getQuizResults);
router.get('/:id/attempts', protect, getQuizAttempts);

module.exports = router;