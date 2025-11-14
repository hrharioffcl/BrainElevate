const mongoose = require("mongoose");


const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  createdAt: { type: Date, default: Date.now },
});

wishlistSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('WishList', wishlistSchema)