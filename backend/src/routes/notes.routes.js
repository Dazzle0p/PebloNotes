const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getNotes, getNote, createNote, updateNote, deleteNote,
  generateSummary, shareNote, unshareNote
} = require('../controllers/notes.controller');

router.use(protect);
router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/generate-summary', generateSummary);
router.post('/:id/share', shareNote);
router.post('/:id/unshare', unshareNote);

module.exports = router;
