const Note = require('../models/Note.model');

exports.getSharedNote = async (req, res) => {
  try {
    const note = await Note.findOne({ shareId: req.params.shareId, isPublic: true })
      .populate('user', 'name');
    if (!note) return res.status(404).json({ error: 'Note not found or no longer public' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
