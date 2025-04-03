const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/')
  .get(getRestaurants)
  .post(protect, admin, createRestaurant);

router.route('/:id')
  .get(getRestaurantById)
  .put(protect, admin, updateRestaurant)
  .delete(protect, admin, deleteRestaurant);

// Menu items routes
router.route('/:id/menu')
  .post(protect, admin, addMenuItem);

router.route('/:id/menu/:itemId')
  .put(protect, admin, updateMenuItem)
  .delete(protect, admin, deleteMenuItem);

module.exports = router;
