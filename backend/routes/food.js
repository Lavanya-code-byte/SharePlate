const express = require('express');
const router = express.Router();
const FoodListing = require('../models/FoodListing');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create a Food Listing (Restaurant only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Only restaurants can upload surplus food' });
    }

    const { itemName, description, quantity, expiryTime, foodType } = req.body;

    const listing = new FoodListing({
      restaurant: req.user._id,
      itemName,
      description,
      quantity,
      expiryTime,
      foodType,
    });

    await listing.save();
    
    // Return listing populated with restaurant info
    const populated = await FoodListing.findById(listing._id).populate('restaurant', 'name address latitude longitude');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating food listing:', error);
    res.status(500).json({ message: 'Server error creating food listing' });
  }
});

// Get all Available Food Listings
router.get('/', auth, async (req, res) => {
  try {
    const listings = await FoodListing.find({ status: 'Available' })
      .populate('restaurant', 'name address latitude longitude')
      .sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (error) {
    console.error('Error fetching food listings:', error);
    res.status(500).json({ message: 'Server error fetching listings' });
  }
});

// Get My Food Listings (Restaurant only)
router.get('/my-listings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const listings = await FoodListing.find({ restaurant: req.user._id })
      .populate('claimedBy', 'name address')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error('Error fetching restaurant listings:', error);
    res.status(500).json({ message: 'Server error fetching your listings' });
  }
});

// Claim a Food Listing (NGO only)
router.post('/:id/claim', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can claim food' });
    }

    const food = await FoodListing.findById(req.id || req.params.id).populate('restaurant');
    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (food.status !== 'Available') {
      return res.status(400).json({ message: 'This food listing is already claimed or delivered' });
    }

    // Update food status
    food.status = 'Claimed';
    food.claimedBy = req.user._id;
    await food.save();

    // Generate simulated routing polyline between Restaurant and NGO coordinates
    // We will interpolate 12 steps to show a progressive delivery path
    const R_lat = food.restaurant.latitude;
    const R_lon = food.restaurant.longitude;
    const N_lat = req.user.latitude;
    const N_lon = req.user.longitude;

    const steps = 12;
    const routeCoordinates = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = R_lat + (N_lat - R_lat) * t;
      const lon = R_lon + (N_lon - R_lon) * t;
      routeCoordinates.push({ latitude: lat, longitude: lon });
    }

    // Create the Delivery tracking item
    const delivery = new Delivery({
      foodListing: food._id,
      restaurant: food.restaurant._id,
      ngo: req.user._id,
      deliveryPartner: null, // assigned later by a delivery partner
      status: 'Assigned',
      currentLatitude: R_lat,
      currentLongitude: R_lon,
      route: routeCoordinates,
      routeStepIndex: 0,
    });

    await delivery.save();

    res.json({
      message: 'Food listing claimed successfully! Delivery job has been created.',
      food,
      delivery,
    });
  } catch (error) {
    console.error('Error claiming food listing:', error);
    res.status(500).json({ message: 'Server error during food claim' });
  }
});

// Delete a Food Listing (Restaurant only, and only if status is 'Available')
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Only restaurants can delete food listings' });
    }

    const food = await FoodListing.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check ownership
    if (food.restaurant.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this listing' });
    }

    // Check status
    if (food.status !== 'Available') {
      return res.status(400).json({ message: 'Cannot delete a listing that has already been claimed or delivered' });
    }

    await FoodListing.findByIdAndDelete(req.params.id);
    
    // Also clean up any associated Delivery just in case
    await Delivery.deleteMany({ foodListing: req.params.id });

    res.json({ message: 'Food listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting food listing:', error);
    res.status(500).json({ message: 'Server error deleting food listing' });
  }
});

module.exports = router;
