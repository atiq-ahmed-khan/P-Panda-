const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Restaurant = require('../models/restaurantModel');
const Order = require('../models/orderModel');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { restaurant, rating, comment, order, images } = req.body;

  // Check if restaurant exists
  const restaurantExists = await Restaurant.findById(restaurant);
  if (!restaurantExists) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Check if order exists and belongs to user
  const orderExists = await Order.findById(order);
  if (!orderExists || orderExists.user.toString() !== req.user._id.toString()) {
    res.status(400);
    throw new Error('Invalid order');
  }

  // Check if user already reviewed this order
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    order: order,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Order already reviewed');
  }

  const review = await Review.create({
    user: req.user._id,
    restaurant,
    rating,
    comment,
    order,
    images,
  });

  // Update restaurant rating
  const reviews = await Review.find({ restaurant: restaurant });
  restaurantExists.rating =
    reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
  restaurantExists.numReviews = reviews.length;
  await restaurantExists.save();

  res.status(201).json(review);
});

// @desc    Get restaurant reviews
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
const getRestaurantReviews = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Review.countDocuments({
    restaurant: req.params.restaurantId,
  });
  const reviews = await Review.find({ restaurant: req.params.restaurantId })
    .populate('user', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort('-createdAt');

  res.json({
    reviews,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    // Check if review belongs to user
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    review.images = req.body.images || review.images;

    const updatedReview = await review.save();

    // Update restaurant rating
    const restaurant = await Restaurant.findById(review.restaurant);
    const reviews = await Review.find({ restaurant: review.restaurant });
    restaurant.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await restaurant.save();

    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    // Check if review belongs to user or user is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized');
    }

    await review.remove();

    // Update restaurant rating
    const restaurant = await Restaurant.findById(review.restaurant);
    const reviews = await Review.find({ restaurant: review.restaurant });
    if (reviews.length > 0) {
      restaurant.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    } else {
      restaurant.rating = 0;
    }
    restaurant.numReviews = reviews.length;
    await restaurant.save();

    res.json({ message: 'Review removed' });
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private/Admin
const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    review.reply = {
      comment: req.body.comment,
      createdAt: Date.now(),
    };

    const updatedReview = await review.save();
    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

module.exports = {
  createReview,
  getRestaurantReviews,
  updateReview,
  deleteReview,
  replyToReview,
};
