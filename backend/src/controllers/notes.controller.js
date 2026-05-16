const Note = require('../models/Note.model');
const { generateAISummary } = require('../services/ai.service');

exports.getNotes = async (req, res) => {
  try {
    const { search, tag, category, archived, sort = '-updatedAt' } = req.query;
    const query = { user: req.user._id };

    if (archived === 'true') query.isArchived = true;
    else query.isArchived = false;

    if (tag) query.tags = tag.toLowerCase();
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(query).sort(sort).select('-content');
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const note = await Note.create({ user: req.user._id, title, content, tags, category });
    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags, category, isArchived, isPublic } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, tags, category, isArchived, isPublic, lastAutoSaved: Date.now() },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateSummary = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    if (!note.content?.trim()) return res.status(400).json({ error: 'Note has no content to summarise' });

    const result = await generateAISummary(note.title, note.content);

    note.aiSummary = result.summary;
    note.aiActionItems = result.action_items;
    if (result.suggested_title && note.title === 'Untitled Note') note.title = result.suggested_title;
    note.aiGeneratedAt = new Date();
    await note.save();

    // Increment user AI usage
    req.user.aiUsageCount += 1;
    await req.user.save();

    res.json({ note, ai: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shareNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    note.generateShareId();
    note.isPublic = true;
    await note.save();

    res.json({ shareId: note.shareId, shareUrl: `/shared/${note.shareId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unshareNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    note.isPublic = false;
    await note.save();
    res.json({ message: 'Note is now private' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
