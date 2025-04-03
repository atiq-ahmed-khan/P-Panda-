const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getAllOrders,
  getRestaurantOrders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/restaurant/:restaurantId').get(protect, getRestaurantOrders);

router.route('/:id')
  .get(protect, getOrderById)
  .put(protect, updateOrderStatus);

module.exports = router;
