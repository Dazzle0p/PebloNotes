const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Note', trim: true },
  content: { type: String, default: '' },
  tags: [{ type: String, trim: true, lowercase: true }],
  category: { type: String, trim: true, default: 'General' },
  isArchived: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  shareId: { type: String, unique: true, sparse: true },
  aiSummary: { type: String, default: null },
  aiActionItems: [{ type: String }],
  aiGeneratedAt: { type: Date, default: null },
  lastAutoSaved: { type: Date, default: Date.now },
}, { timestamps: true });

// Text index for search
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ user: 1, updatedAt: -1 });

noteSchema.methods.generateShareId = function () {
  if (!this.shareId) this.shareId = nanoid(10);
  return this.shareId;
};

module.exports = mongoose.model('Note', noteSchema);
