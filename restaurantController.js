const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/restaurantModel');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const cuisine = req.query.cuisine
    ? {
        cuisine: {
          $in: [req.query.cuisine],
        },
      }
    : {};

  const count = await Restaurant.countDocuments({ ...keyword, ...cuisine });
  const restaurants = await Restaurant.find({ ...keyword, ...cuisine })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ rating: -1 });

  res.json({
    restaurants,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (restaurant) {
    res.json(restaurant);
  } else {
    res.status(404);
    throw new Error('Restaurant not found');
  }
});

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
const createRestaurant = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    cuisine,
    address,
    phone,
    email,
    openingHours,
    deliveryTime,
    minimumOrder,
    deliveryFee,
    images,
  } = req.body;

  const restaurant = await Restaurant.create({
    name,
    description,
    cuisine,
    address,
    phone,
    email,
    openingHours,
    deliveryTime,
    minimumOrder,
    deliveryFee,
    images,
  });

  if (restaurant) {
    res.status(201).json(restaurant);
  } else {
    res.status(400);
    throw new Error('Invalid restaurant data');
  }
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (restaurant) {
    restaurant.name = req.body.name || restaurant.name;
    restaurant.description = req.body.description || restaurant.description;
    restaurant.cuisine = req.body.cuisine || restaurant.cuisine;
    restaurant.address = req.body.address || restaurant.address;
    restaurant.phone = req.body.phone || restaurant.phone;
    restaurant.email = req.body.email || restaurant.email;
    restaurant.openingHours = req.body.openingHours || restaurant.openingHours;
    restaurant.deliveryTime = req.body.deliveryTime || restaurant.deliveryTime;
    restaurant.minimumOrder = req.body.minimumOrder || restaurant.minimumOrder;
    restaurant.deliveryFee = req.body.deliveryFee || restaurant.deliveryFee;
    restaurant.images = req.body.images || restaurant.images;
    restaurant.isActive = req.body.isActive !== undefined ? req.body.isActive : restaurant.isActive;

    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant);
  } else {
    res.status(404);
    throw new Error('Restaurant not found');
  }
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (restaurant) {
    await restaurant.remove();
    res.json({ message: 'Restaurant removed' });
  } else {
    res.status(404);
    throw new Error('Restaurant not found');
  }
});

// @desc    Add menu item
// @route   POST /api/restaurants/:id/menu
// @access  Private/Admin
const addMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (restaurant) {
    const {
      name,
      description,
      price,
      category,
      image,
    } = req.body;

    restaurant.menu.push({
      name,
      description,
      price,
      category,
      image,
    });

    const updatedRestaurant = await restaurant.save();
    res.status(201).json(updatedRestaurant);
  } else {
    res.status(404);
    throw new Error('Restaurant not found');
  }
});

// @desc    Update menu item
// @route   PUT /api/restaurants/:id/menu/:itemId
// @access  Private/Admin
const updateMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (restaurant) {
    const menuItem = restaurant.menu.id(req.params.itemId);

    if (menuItem) {
      menuItem.name = req.body.name || menuItem.name;
      menuItem.description = req.body.description || menuItem.description;
      menuItem.price = req.body.price || menuItem.price;
      menuItem.category = req.body.category || menuItem.category;
      menuItem.image = req.body.image || menuItem.image;
      menuItem.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : menuItem.isAvailable;

      const updatedRestaurant = await restaurant.save();
      res.json(updatedRestaurant);
    } else {
      res.status(404);
      throw new Error('Menu item not found');
    }
  } else {
    res.status(404);
    throw new Error('Restaurant not found');
  }
});

// @desc    Delete menu item
// @route   DELETE /api/restaurants/:id/menu/:itemId
// @access  Private/Admin
const deleteMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (restaurant) {
    const menuItem = restaurant.menu.id(req.params.itemId);

    if (menuItem) {
      menuItem.remove();
      const updatedRestaurant = await restaurant.save();
      res.json(updatedRestaurant);
    } else {
      res.status(404);
      throw new Error('Menu item not found');
    }
  } else {
    res.status(404);
    throw new Error('Restaurant not found');
  }
});

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
