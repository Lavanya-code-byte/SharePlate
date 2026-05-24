const mongoose = require('mongoose');

const FoodListingSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true, // e.g. in kg
  },
  expiryTime: {
    type: Date,
    required: true,
  },
  foodType: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Vegan', 'Other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Claimed', 'Delivered'],
    default: 'Available',
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FoodListing', FoodListingSchema);
