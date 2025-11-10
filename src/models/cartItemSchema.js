const mongoose = require("mongoose");


const cartItemSchema = new mongoose.Schema({
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  basePrice: { type: Number, required: true },
  discountType: { type: String, enum: ['course', 'global', 'free', 'none'], default: 'none' },
  discountValue: { type: Number, default: 0 },
  finalPrice: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
