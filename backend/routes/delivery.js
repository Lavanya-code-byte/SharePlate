const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const FoodListing = require('../models/FoodListing');
const auth = require('../middleware/auth');

// Get all Unassigned Deliveries (Delivery Partner only)
router.get('/unassigned', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access denied. Delivery partners only.' });
    }

    const deliveries = await Delivery.find({ deliveryPartner: null, status: 'Assigned' })
      .populate('foodListing', 'itemName quantity expiryTime foodType')
      .populate('restaurant', 'name address latitude longitude')
      .populate('ngo', 'name address latitude longitude')
      .sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching unassigned deliveries:', error);
    res.status(500).json({ message: 'Server error fetching delivery tasks' });
  }
});

// Get My Assigned/Completed Jobs (Delivery Partner only)
router.get('/my-jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jobs = await Delivery.find({ deliveryPartner: req.user._id })
      .populate('foodListing', 'itemName quantity status foodType')
      .populate('restaurant', 'name address')
      .populate('ngo', 'name address')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching my jobs:', error);
    res.status(500).json({ message: 'Server error fetching your jobs' });
  }
});

// Get All Active Deliveries for Current User (works for Restaurant, NGO, and Delivery Partner)
router.get('/active', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'restaurant') {
      query = { restaurant: req.user._id, status: { $in: ['Assigned', 'In Transit'] } };
    } else if (req.user.role === 'ngo') {
      query = { ngo: req.user._id, status: { $in: ['Assigned', 'In Transit'] } };
    } else if (req.user.role === 'delivery') {
      query = { deliveryPartner: req.user._id, status: { $in: ['Assigned', 'In Transit'] } };
    }

    const active = await Delivery.find(query)
      .populate('foodListing', 'itemName quantity foodType')
      .populate('restaurant', 'name address latitude longitude')
      .populate('ngo', 'name address latitude longitude')
      .populate('deliveryPartner', 'name email');

    res.json(active);
  } catch (error) {
    console.error('Error fetching active deliveries:', error);
    res.status(500).json({ message: 'Server error fetching active deliveries' });
  }
});

// Accept a Delivery (Delivery Partner only)
router.post('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery task not found' });
    }

    if (delivery.deliveryPartner) {
      return res.status(400).json({ message: 'Delivery already claimed by another driver' });
    }

    delivery.deliveryPartner = req.user._id;
    await delivery.save();

    // Link the partner to the food listing as well
    const food = await FoodListing.findById(delivery.foodListing);
    if (food) {
      food.deliveryPartner = req.user._id;
      await food.save();
    }

    res.json({
      message: 'Delivery accepted successfully!',
      delivery,
    });
  } catch (error) {
    console.error('Error accepting delivery:', error);
    res.status(500).json({ message: 'Server error accepting delivery' });
  }
});

// Start transit (Delivery Partner only)
router.post('/:id/start', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery task not found' });
    }

    if (delivery.deliveryPartner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this delivery' });
    }

    if (delivery.status !== 'Assigned') {
      return res.status(400).json({ message: 'Delivery has already started or is completed' });
    }

    delivery.status = 'In Transit';
    delivery.routeStepIndex = 0;
    delivery.currentLatitude = delivery.route[0].latitude;
    delivery.currentLongitude = delivery.route[0].longitude;
    await delivery.save();

    res.json({
      message: 'Transit started! The real-time simulated tracker is now active.',
      delivery,
    });
  } catch (error) {
    console.error('Error starting transit:', error);
    res.status(500).json({ message: 'Server error starting transit' });
  }
});

// Get detailed status of a specific delivery
router.get('/:id', auth, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('foodListing', 'itemName quantity foodType status')
      .populate('restaurant', 'name address latitude longitude')
      .populate('ngo', 'name address latitude longitude')
      .populate('deliveryPartner', 'name');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching delivery' });
  }
});

module.exports = router;
