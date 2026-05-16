const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getInsights } = require('../controllers/insights.controller');
router.get('/', protect, getInsights);
module.exports = router;
