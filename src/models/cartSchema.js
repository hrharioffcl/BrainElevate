const mongoose = require("mongoose");



const cartSchema = new mongoose.Schema({
  cartUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
  appliedCoupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  subTotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
