const express = require('express');
const router = express.Router();
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get Overall Platform Analytics
router.get('/', auth, async (req, res) => {
  try {
    // 1. Total weight saved (Delivered food listings)
    const weightResult = await FoodListing.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalWeightSaved = weightResult[0]?.total || 0;
    
    // 2. Total meals redirected (assuming average meal size of 0.4 kg)
    const mealsRedistributed = Math.round(totalWeightSaved / 0.4);

    // 3. CO2 Offset (avg 2.5kg of CO2 reduced per 1kg of food waste prevented)
    const co2Offset = Number((totalWeightSaved * 2.5).toFixed(1));

    // 4. Status breakdown
    const totalListings = await FoodListing.countDocuments();
    const availableCount = await FoodListing.countDocuments({ status: 'Available' });
    const claimedCount = await FoodListing.countDocuments({ status: 'Claimed' });
    const deliveredCount = await FoodListing.countDocuments({ status: 'Delivered' });

    // 5. Food types breakdown (Veg / Non-Veg / Vegan / Other)
    const foodTypeStats = await FoodListing.aggregate([
      { $group: { _id: '$foodType', count: { $sum: 1 }, totalWeight: { $sum: '$quantity' } } }
    ]);

    // 6. Time trend (delivered listings grouped by day of the week or month)
    const timeTrend = await FoodListing.aggregate([
      { $match: { status: 'Delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          weight: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 10 }
    ]);

    // Format time trend for frontend charting (Recharts)
    const trendData = timeTrend.map(t => ({
      date: t._id,
      weight: t.weight,
      count: t.count
    }));

    // 7. Top NGOs claimed stats
    const ngoStats = await FoodListing.aggregate([
      { $match: { claimedBy: { $ne: null } } },
      { $group: { _id: '$claimedBy', count: { $sum: 1 }, weight: { $sum: '$quantity' } } },
      { $sort: { weight: -1 } },
      { $limit: 5 }
    ]);

    // Populate NGO names
    const populatedNgos = await User.populate(ngoStats, { path: '_id', select: 'name' });
    const ngoDistributionData = populatedNgos.map(n => ({
      ngoName: n._id ? n._id.name : 'Unknown NGO',
      count: n.count,
      weight: n.weight
    }));

    // 8. Top Restaurants surplus stats (Successfully Delivered surplus)
    const restaurantStats = await FoodListing.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: '$restaurant', count: { $sum: 1 }, weight: { $sum: '$quantity' } } },
      { $sort: { weight: -1 } },
      { $limit: 5 }
    ]);

    // Populate Restaurant names
    const populatedRestaurants = await User.populate(restaurantStats, { path: '_id', select: 'name' });
    const restaurantDistributionData = populatedRestaurants.map(r => ({
      restaurantName: r._id ? r._id.name : 'Unknown Restaurant',
      count: r.count,
      weight: r.weight
    }));

    res.json({
      summary: {
        totalWeightSaved,
        mealsRedistributed,
        co2Offset,
        totalListings,
        availableCount,
        claimedCount,
        deliveredCount,
      },
      foodTypeStats: foodTypeStats.map(s => ({
        type: s._id,
        count: s.count,
        weight: s.totalWeight,
      })),
      trendData,
      ngoDistribution: ngoDistributionData,
      restaurantDistribution: restaurantDistributionData,
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ message: 'Server error generating analytics statistics' });
  }
});

module.exports = router;
