const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  addReview,
  getCoursesByCategory,
  searchCourses
} = require('../controllers/courseController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/')
  .get(getCourses)
  .post(protect, createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/reviews', protect, addReview);
router.get('/category/:category', getCoursesByCategory);
router.get('/search/:query', searchCourses);

module.exports = router;