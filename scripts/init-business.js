const mongoose = require('mongoose');
const Business = require('../models/Business');
const Reward = require('../models/Reward');
require('dotenv').config();

async function initializeBusiness() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if business already exists
    const existingBusiness = await Business.findOne();
    if (existingBusiness) {
      console.log('Business already exists:', existingBusiness.businessName);
      return;
    }

    // Create business account
    const business = new Business({
      businessName: 'Fades n Braids',
      email: process.env.BUSINESS_EMAIL || 'admin@fadesbraids.com',
      password: process.env.BUSINESS_PASSWORD || 'admin123',
      phone: '0712345678',
      address: {
        street: '123 Style Street',
        city: 'Nairobi',
        state: 'Nairobi',
        zipCode: '00100'
      },
      settings: {
        pointsPerVisit: 10,
        codeRefreshInterval: 5,
        welcomeBonus: 50
      }
    });

    await business.save();
    console.log('Business account created successfully!');
    console.log('Email:', business.email);
    console.log('Password:', process.env.BUSINESS_PASSWORD || 'admin123');

    // Create default rewards
    const defaultRewards = [
      {
        title: '10% Off Next Service',
        description: 'Get 10% off your next haircut or styling service',
        pointsRequired: 100,
        category: 'discount',
        value: '10% off',
        terms: 'Valid for haircuts and styling services only. Cannot be combined with other offers.'
      },
      {
        title: 'Free Hair Wash',
        description: 'Complimentary hair wash and conditioning treatment',
        pointsRequired: 150,
        category: 'free_service',
        value: 'Free service',
        terms: 'Valid for basic wash and conditioning. Upgrade treatments available for additional cost.'
      },
      {
        title: '20% Off Premium Service',
        description: 'Get 20% off any premium styling or treatment service',
        pointsRequired: 250,
        category: 'discount',
        value: '20% off',
        terms: 'Valid for premium services including braids, extensions, and specialty treatments.'
      },
      {
        title: 'Free Haircut',
        description: 'Complimentary basic haircut service',
        pointsRequired: 400,
        category: 'free_service',
        value: 'Free haircut',
        terms: 'Valid for basic haircut only. Styling and treatments not included.'
      },
      {
        title: 'VIP Package',
        description: 'Complete VIP treatment including cut, style, and premium products',
        pointsRequired: 600,
        category: 'special_offer',
        value: 'VIP Package',
        terms: 'Includes haircut, styling, premium shampoo and conditioning, and take-home product sample.'
      }
    ];

    for (const rewardData of defaultRewards) {
      const reward = new Reward(rewardData);
      await reward.save();
      console.log(`Created reward: ${reward.title}`);
    }

    console.log('\nInitialization complete!');
    console.log('You can now:');
    console.log('1. Start the server with: npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Login to business dashboard at /business/login');
    console.log(`4. Use email: ${business.email}`);
    console.log(`5. Use password: ${process.env.BUSINESS_PASSWORD || 'admin123'}`);

  } catch (error) {
    console.error('Initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run initialization
initializeBusiness();
