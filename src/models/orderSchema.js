
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }, // optional link to the old cart
  items: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    basePrice: { type: Number, required: true },
    discountType: { type: String, default: 'none' },
    discountValue: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, enum: ['razorpay', 'stripe', 'paypal', 'cod'], default: 'razorpay' },
  transactionId: { type: String }, // from payment gateway
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
