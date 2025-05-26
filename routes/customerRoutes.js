const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getProfile,
  updateProfile,
  checkIn,
  getVisitHistory,
  getAvailableRewards,
  redeemReward,
  getClaimedRewards
} = require('../controllers/customerController');

const { authenticateCustomer } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
];

const loginValidation = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
];

// Public routes
router.post('/register', registerValidation, registerCustomer);
router.post('/login', loginValidation, loginCustomer);

// Protected routes (require authentication)
router.use(authenticateCustomer);

router.post('/logout', logoutCustomer);
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.post('/checkin', checkIn);
router.get('/visits', getVisitHistory);
router.get('/rewards', getAvailableRewards);
router.get('/rewards/claimed', getClaimedRewards);
router.post('/rewards/:rewardId/redeem', redeemReward);

module.exports = router;