const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  foodListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing',
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['Assigned', 'In Transit', 'Delivered'],
    default: 'Assigned',
  },
  currentLatitude: {
    type: Number,
  },
  currentLongitude: {
    type: Number,
  },
  route: [{
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }],
  routeStepIndex: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Delivery', DeliverySchema);
