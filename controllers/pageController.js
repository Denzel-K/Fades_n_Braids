const { optionalAuth } = require('../middleware/authMiddleware');

// Landing page
const getLandingPage = async (req, res) => {
  try {
    res.render('landing', {
      title: 'Welcome to Fades n Braids - Loyalty Program',
      layout: 'main',
      customer: req.customer || null,
      business: req.business || null
    });
  } catch (error) {
    console.error('Landing page error:', error);
    res.status(500).render('error', {
      title: 'Error - Fades n Braids',
      message: 'Failed to load page',
      layout: 'main'
    });
  }
};

// Customer dashboard page
const getCustomerDashboard = async (req, res) => {
  try {
    // Ensure customer object has all required properties with safe defaults
    const customer = {
      ...req.customer.toObject(),
      totalVisits: req.customer.totalVisits || 0,
      totalPoints: req.customer.totalPoints || 0,
      availablePoints: req.customer.availablePoints || 0,
      rewards: req.customer.rewards || []
    };

    console.log('Customer dashboard data:', {
      id: customer._id,
      name: customer.firstName,
      totalVisits: customer.totalVisits,
      totalPoints: customer.totalPoints,
      availablePoints: customer.availablePoints,
      rewardsCount: customer.rewards.length
    });

    res.render('customer/dashboard', {
      title: 'Customer Dashboard - Fades n Braids',
      layout: 'main',
      customer: customer
    });
  } catch (error) {
    console.error('Customer dashboard error:', error);
    res.status(500).render('error', {
      title: 'Error - Fades n Braids',
      message: 'Failed to load dashboard',
      layout: 'main'
    });
  }
};

// Customer login page
const getCustomerLogin = async (req, res) => {
  try {
    // Redirect if already logged in
    if (req.customer) {
      return res.redirect('/customer/dashboard');
    }

    res.render('customer/login', {
      title: 'Customer Login - Fades n Braids',
      layout: 'main'
    });
  } catch (error) {
    console.error('Customer login page error:', error);
    res.status(500).render('error', {
      title: 'Error - Fades n Braids',
      message: 'Failed to load login page',
      layout: 'main'
    });
  }
};

// Customer register page
const getCustomerRegister = async (req, res) => {
  try {
    // Redirect if already logged in
    if (req.customer) {
      return res.redirect('/customer/dashboard');
    }

    res.render('customer/register', {
      title: 'Join Loyalty Program - Fades n Braids',
      layout: 'main'
    });
  } catch (error) {
    console.error('Customer register page error:', error);
    res.status(500).render('error', {
      title: 'Error - Fades n Braids',
      message: 'Failed to load registration page',
      layout: 'main'
    });
  }
};

// Business login page
const getBusinessLogin = async (req, res) => {
  try {
    // Redirect if already logged in
    if (req.business) {
      return res.redirect('/business/dashboard');
    }

    res.render('business/login', {
      title: 'Business Login - Fades n Braids',
      layout: 'main'
    });
  } catch (error) {
    console.error('Business login page error:', error);
    res.status(500).render('error', {
      title: 'Error - Fades n Braids',
      message: 'Failed to load business login page',
      layout: 'main'
    });
  }
};

// Business dashboard page
const getBusinessDashboard = async (req, res) => {
  try {
    res.render('business/dashboard', {
      title: 'Business Dashboard - Fades n Braids',
      layout: 'main',
      business: req.business
    });
  } catch (error) {
    console.error('Business dashboard error:', error);
    res.status(500).render('error', {
      title: 'Error - Fades n Braids',
      message: 'Failed to load business dashboard',
      layout: 'main'
    });
  }
};

// Business check-in codes page
const getCheckInCodes = async (req, res) => {
  try {
    res.render('business/checkin-codes', {
      title: 'Check-in Codes - Fades n Braids',
      layout: 'main',
      business: req.business
    });
  } catch (error) {
    console.error('Check-in codes page error:', error);
    res.status(500).render('error', {
      title: 'Error - Fades n Braids',
      message: 'Failed to load check-in codes page',
      layout: 'main'
    });
  }
};

module.exports = {
  getLandingPage,
  getCustomerDashboard,
  getCustomerLogin,
  getCustomerRegister,
  getBusinessLogin,
  getBusinessDashboard,
  getCheckInCodes
};