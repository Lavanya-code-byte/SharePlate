const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Delivery = require('../models/Delivery');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shareplate');
    console.log('Connected to MongoDB for seeding.');

    // Clear existing data
    await User.deleteMany({});
    await FoodListing.deleteMany({});
    await Delivery.deleteMany({});
    console.log('Cleared existing data.');

    // Helper for password hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create Users (Mumbai, India locations)
    console.log('Seeding users...');
    const users = await User.create([
      // Restaurants
      {
        name: 'Mumbai Spice Kitchen',
        email: 'bistro@shareplate.org',
        password: passwordHash,
        role: 'restaurant',
        address: 'Colaba Causeway, Colaba, Mumbai, Maharashtra 400005',
        latitude: 18.9140,
        longitude: 72.8280,
      },
      {
        name: 'Taj Mahal Palace Restaurant',
        email: 'mission@shareplate.org',
        password: passwordHash,
        role: 'restaurant',
        address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
        latitude: 18.9218,
        longitude: 72.8324,
      },
      {
        name: 'Bandra Seafront Gourmet',
        email: 'marina@shareplate.org',
        password: passwordHash,
        role: 'restaurant',
        address: 'Carter Road, Bandra West, Mumbai, Maharashtra 400050',
        latitude: 19.0600,
        longitude: 72.8220,
      },
      // NGOs
      {
        name: 'Mumbai Compassion Community Kitchen',
        email: 'compassion@shareplate.org',
        password: passwordHash,
        role: 'ngo',
        address: 'Mahim Causeway, Mahim, Mumbai, Maharashtra 400016',
        latitude: 19.0390,
        longitude: 72.8400,
      },
      {
        name: 'Dharavi Relief Harvest',
        email: 'rescue@shareplate.org',
        password: passwordHash,
        role: 'ngo',
        address: 'Sion-Dharavi Road, Dharavi, Mumbai, Maharashtra 400017',
        latitude: 19.0380,
        longitude: 72.8538,
      },
      // Delivery Partners
      {
        name: 'Aarav - Eco Courier',
        email: 'alex@shareplate.org',
        password: passwordHash,
        role: 'delivery',
        address: 'CST Terminal Hub, Mumbai, Maharashtra 400001',
        latitude: 18.9400,
        longitude: 72.8350,
      },
      {
        name: 'Tanvi - Rapid Food Runner',
        email: 'taylor@shareplate.org',
        password: passwordHash,
        role: 'delivery',
        address: 'BKC Plaza, Bandra East, Mumbai, Maharashtra 400051',
        latitude: 19.0600,
        longitude: 72.8600,
      },
    ]);

    const bistro = users[0];
    const missionGrill = users[1];
    const marinaGourmet = users[2];
    const compassionKitchen = users[3];
    const rescueHarvest = users[4];
    const alex = users[5];
    const taylor = users[6];

    console.log('Seeding food listings and simulated deliveries...');

    // 1. Seed Completed Listings (historical for analytics)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dynamicDate = (offsetDays) => {
      const d = new Date();
      d.setDate(d.getDate() - offsetDays);
      return d;
    };

    const completedFoods = await FoodListing.create([
      {
        restaurant: bistro._id,
        itemName: 'Premium Veggie Burgers & Sliders',
        description: 'Assorted vegan burger sliders with whole wheat buns and dynamic dips.',
        quantity: 8.5, // kg
        expiryTime: yesterday,
        foodType: 'Vegan',
        status: 'Delivered',
        claimedBy: compassionKitchen._id,
        deliveryPartner: alex._id,
        createdAt: dynamicDate(4),
      },
      {
        restaurant: missionGrill._id,
        itemName: 'Smoked Salmon Salads & Quinoa Cups',
        description: 'High nutrition salmon lunches stored under cold refrigeration. Pristine quality.',
        quantity: 12.0, // kg
        expiryTime: yesterday,
        foodType: 'Non-Veg',
        status: 'Delivered',
        claimedBy: rescueHarvest._id,
        deliveryPartner: taylor._id,
        createdAt: dynamicDate(3),
      },
      {
        restaurant: marinaGourmet._id,
        itemName: 'Assorted Gourmet Pastries & Bagels',
        description: 'Delicious morning goods, fresh bakery croissants and organic butter bagels.',
        quantity: 6.4, // kg
        expiryTime: yesterday,
        foodType: 'Veg',
        status: 'Delivered',
        claimedBy: compassionKitchen._id,
        deliveryPartner: alex._id,
        createdAt: dynamicDate(2),
      },
      {
        restaurant: bistro._id,
        itemName: 'Creamy Butternut Squash Soup',
        description: 'Warm containers of freshly cooked soup, perfect for freezing.',
        quantity: 15.0, // kg
        expiryTime: yesterday,
        foodType: 'Veg',
        status: 'Delivered',
        claimedBy: rescueHarvest._id,
        deliveryPartner: taylor._id,
        createdAt: dynamicDate(1),
      },
    ]);

    // Create corresponding historical completed Delivery items
    for (const food of completedFoods) {
      const R_lat = food.restaurant.toString() === bistro._id.toString() ? bistro.latitude :
                    food.restaurant.toString() === missionGrill._id.toString() ? missionGrill.latitude : marinaGourmet.latitude;
      const R_lon = food.restaurant.toString() === bistro._id.toString() ? bistro.longitude :
                    food.restaurant.toString() === missionGrill._id.toString() ? missionGrill.longitude : marinaGourmet.longitude;
      
      const N_lat = food.claimedBy.toString() === compassionKitchen._id.toString() ? compassionKitchen.latitude : rescueHarvest.latitude;
      const N_lon = food.claimedBy.toString() === compassionKitchen._id.toString() ? compassionKitchen.longitude : rescueHarvest.longitude;

      await Delivery.create({
        foodListing: food._id,
        restaurant: food.restaurant,
        ngo: food.claimedBy,
        deliveryPartner: food.deliveryPartner,
        status: 'Delivered',
        currentLatitude: N_lat,
        currentLongitude: N_lon,
        route: [
          { latitude: R_lat, longitude: R_lon },
          { latitude: N_lat, longitude: N_lon }
        ],
        routeStepIndex: 1,
        createdAt: food.createdAt,
      });
    }

    // 2. Seed Active Listings
    const listings = await FoodListing.create([
      {
        restaurant: bistro._id,
        itemName: 'Penne Arrabbiata & Garlic Rolls',
        description: 'Large trays of spicy Italian pasta, fresh tomato sauce and herb seasoned garlic rolls.',
        quantity: 5.5, // kg
        expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // expires in 6h
        foodType: 'Veg',
        status: 'Available',
      },
      {
        restaurant: missionGrill._id,
        itemName: 'BBQ Pulled Pork Sandwiches',
        description: 'Smoked meats, vacuum sealed, stored at safe temperatures.',
        quantity: 10.0, // kg
        expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // expires in 8h
        foodType: 'Non-Veg',
        status: 'Available',
      },
      {
        restaurant: marinaGourmet._id,
        itemName: 'Organic Fruit Parfaits & Wraps',
        description: 'Delicious snack pots and spinach vegetable wraps. Ideal afternoon refreshments.',
        quantity: 4.2, // kg
        expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // expires in 3h
        foodType: 'Veg',
        status: 'Available',
      },
    ]);

    // 3. Seed Claimed/Assigned Listings (ready to be picked up or in transit)
    const claimedFood = await FoodListing.create({
      restaurant: missionGrill._id,
      itemName: 'Teriyaki Chicken Bowls & Rice',
      description: 'Healthy nutrient chicken rice bowls, individually packed. Excellent condition.',
      quantity: 7.5,
      expiryTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
      foodType: 'Non-Veg',
      status: 'Claimed',
      claimedBy: compassionKitchen._id,
    });

    // Generate Route coordinates for simulated active delivery
    const R_lat = missionGrill.latitude;
    const R_lon = missionGrill.longitude;
    const N_lat = compassionKitchen.latitude;
    const N_lon = compassionKitchen.longitude;
    const steps = 12;
    const activeRoute = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = R_lat + (N_lat - R_lat) * t;
      const lon = R_lon + (N_lon - R_lon) * t;
      activeRoute.push({ latitude: lat, longitude: lon });
    }

    await Delivery.create({
      foodListing: claimedFood._id,
      restaurant: missionGrill._id,
      ngo: compassionKitchen._id,
      deliveryPartner: null, // Ready for a delivery partner to accept!
      status: 'Assigned',
      currentLatitude: R_lat,
      currentLongitude: R_lon,
      route: activeRoute,
      routeStepIndex: 0,
    });

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
