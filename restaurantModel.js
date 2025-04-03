const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  category: String,
  image: String,
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    cuisine: [{
      type: String,
      required: true,
    }],
    address: {
      street: String,
      city: String,
      area: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    phone: String,
    email: String,
    openingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      min: Number,
      max: Number,
    },
    minimumOrder: Number,
    deliveryFee: Number,
    images: [String],
    menu: [menuItemSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
