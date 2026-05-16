const router = require('express').Router();
const { getSharedNote } = require('../controllers/shared.controller');
router.get('/:shareId', getSharedNote);
module.exports = router;
