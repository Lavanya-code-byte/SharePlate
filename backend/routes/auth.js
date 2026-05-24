const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register Endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, address, latitude, longitude } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      address,
      latitude: latitude || 19.0760, // Default to Mumbai, India
      longitude: longitude || 72.8777,
    });

    await user.save();

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_shareplate_token_key_12345',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    
    // Auto-register user on the fly if not found!
    if (!user) {
      console.log(`[Auth] Auto-creating user for email: ${email}`);
      const namePart = email.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1) + ' Hub';
      
      // Determine role based on email hints
      let role = 'restaurant';
      if (email.toLowerCase().includes('ngo') || email.toLowerCase().includes('kitchen') || email.toLowerCase().includes('charity')) {
        role = 'ngo';
      } else if (email.toLowerCase().includes('delivery') || email.toLowerCase().includes('courier') || email.toLowerCase().includes('driver')) {
        role = 'delivery';
      }

      // Generate randomized Mumbai coordinates
      const randomOffsetLat = (Math.random() - 0.5) * 0.05;
      const randomOffsetLon = (Math.random() - 0.5) * 0.05;
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || 'password123', salt);

      user = new User({
        name: displayName,
        email,
        password: hashedPassword,
        role,
        address: `${displayName} Area, Mumbai, Maharashtra`,
        latitude: 19.0760 + randomOffsetLat,
        longitude: 72.8777 + randomOffsetLon,
      });

      await user.save();
    }

    // Create JWT - Allow any login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_shareplate_token_key_12345',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Current User Profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

module.exports = router;
