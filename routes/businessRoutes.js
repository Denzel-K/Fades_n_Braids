const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  loginBusiness,
  logoutBusiness,
  getDashboard,
  getCurrentCodes,
  getCustomers,
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  updateSettings,
  awardPoints
} = require('../controllers/businessController');

const { authenticateBusiness } = require('../middleware/authMiddleware');

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const rewardValidation = [
  body('title')
    .notEmpty()
    .withMessage('Reward title is required')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Reward description is required')
    .trim(),
  body('pointsRequired')
    .isInt({ min: 1 })
    .withMessage('Points required must be a positive integer'),
  body('value')
    .notEmpty()
    .withMessage('Reward value is required')
    .trim(),
  body('category')
    .optional()
    .isIn(['discount', 'free_service', 'product', 'special_offer'])
    .withMessage('Invalid reward category')
];

const settingsValidation = [
  body('pointsPerVisit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points per visit must be a positive integer'),
  body('codeRefreshInterval')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Code refresh interval must be between 1 and 60 minutes'),
  body('welcomeBonus')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Welcome bonus must be a non-negative integer')
];

// Public routes
router.post('/login', loginValidation, loginBusiness);

// Protected routes (require authentication)
router.use(authenticateBusiness);

router.post('/logout', logoutBusiness);
router.get('/dashboard', getDashboard);
router.get('/codes', getCurrentCodes);
router.get('/customers', getCustomers);
router.get('/rewards', getRewards);
router.post('/rewards', rewardValidation, createReward);
router.put('/rewards/:rewardId', rewardValidation, updateReward);
router.delete('/rewards/:rewardId', deleteReward);
router.put('/settings', settingsValidation, updateSettings);
router.post('/award-points', awardPoints);

module.exports = router;