const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shareplate')
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import Models for Simulator
const Delivery = require('./models/Delivery');
const FoodListing = require('./models/FoodListing');

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/food', require('./routes/food'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/analytics', require('./routes/analytics'));

// Friendly root endpoint
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 4rem; background: #0b0f19; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0;">
      <h1 style="color: #10b981; margin-bottom: 1rem; font-size: 2.25rem;">SharePlate Backend API Server</h1>
      <p style="color: #94a3b8; font-size: 1.1rem; max-width: 600px; line-height: 1.6; margin-bottom: 2rem;">
        This is the Express backend API server. To view and interact with the main application, please open the frontend client port in your browser.
      </p>
      <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
        Go to SharePlate Client (Port 5173)
      </a>
    </div>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SharePlate server is running smoothly' });
});

// Start Real-Time Simulated Tracking Loop
// This runs every 4 seconds in the background. It finds all deliveries that are "In Transit"
// and moves the driver along the path (incrementing routeStepIndex), mimicking real-world GPS.
setInterval(async () => {
  try {
    const activeDeliveries = await Delivery.find({ status: 'In Transit' });
    
    for (const delivery of activeDeliveries) {
      const nextIndex = delivery.routeStepIndex + 1;
      
      if (nextIndex < delivery.route.length) {
        delivery.routeStepIndex = nextIndex;
        delivery.currentLatitude = delivery.route[nextIndex].latitude;
        delivery.currentLongitude = delivery.route[nextIndex].longitude;
        await delivery.save();
        console.log(`[Simulator] Delivery ${delivery._id} moved to step ${nextIndex}/${delivery.route.length - 1}`);
      } else {
        // We reached the NGO destination! Mark as Delivered!
        delivery.status = 'Delivered';
        await delivery.save();

        // Update the corresponding FoodListing
        const food = await FoodListing.findById(delivery.foodListing);
        if (food) {
          food.status = 'Delivered';
          await food.save();
        }
        console.log(`[Simulator] Delivery ${delivery._id} reached destination and marked DELIVERED.`);
      }
    }
  } catch (error) {
    console.error('Error in delivery tracking simulator:', error);
  }
}, 4000);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
