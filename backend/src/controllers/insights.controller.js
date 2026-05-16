const Note = require('../models/Note.model');

exports.getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalNotes,
      archivedNotes,
      recentNotes,
      weeklyNotes,
      allNotes,
      aiUsed,
    ] = await Promise.all([
      Note.countDocuments({ user: userId, isArchived: false }),
      Note.countDocuments({ user: userId, isArchived: true }),
      Note.find({ user: userId, isArchived: false }).sort('-updatedAt').limit(5).select('title updatedAt tags'),
      Note.countDocuments({ user: userId, updatedAt: { $gte: weekAgo } }),
      Note.find({ user: userId }).select('tags'),
      Note.countDocuments({ user: userId, aiGeneratedAt: { $ne: null } }),
    ]);

    // Tag frequency
    const tagMap = {};
    allNotes.forEach(n => n.tags.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
    const topTags = Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    // Weekly activity (last 7 days)
    const weeklyActivity = await Note.aggregate([
      { $match: { user: userId, updatedAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalNotes,
      archivedNotes,
      recentNotes,
      weeklyNotes,
      topTags,
      weeklyActivity,
      aiUsed,
      aiUsageCount: req.user.aiUsageCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
