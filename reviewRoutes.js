const express = require('express');
const router = express.Router();
const {
  createReview,
  getRestaurantReviews,
  updateReview,
  deleteReview,
  replyToReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createReview);

router.route('/restaurant/:restaurantId')
  .get(getRestaurantReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.route('/:id/reply')
  .post(protect, admin, replyToReview);

module.exports = router;
