const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Restaurant = require('../models/restaurantModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    restaurant,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    deliveryFee,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Verify restaurant exists
  const restaurantExists = await Restaurant.findById(restaurant);
  if (!restaurantExists) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  const order = await Order.create({
    user: req.user._id,
    restaurant,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    deliveryFee,
    totalPrice,
  });

  res.status(201).json(order);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('restaurant', 'name');

  if (order && (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin)) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Only admin or restaurant owner can update status
    if (!req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized');
    }

    order.status = req.body.status || order.status;
    
    if (req.body.status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('restaurant', 'name')
    .sort('-createdAt');
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.page) || 1;

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate('user', 'id name')
    .populate('restaurant', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort('-createdAt');

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Get restaurant orders
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private
const getRestaurantOrders = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Check if user is admin or restaurant owner
  if (!req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const pageSize = 20;
  const page = Number(req.query.page) || 1;

  const count = await Order.countDocuments({ restaurant: req.params.restaurantId });
  const orders = await Order.find({ restaurant: req.params.restaurantId })
    .populate('user', 'id name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort('-createdAt');

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getAllOrders,
  getRestaurantOrders,
};
