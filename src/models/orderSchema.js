
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }, // optional link to the old cart
   items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course', // or Product
      required: true,
    }
  ],

  totalAmount: { type: Number, required: true },
  subTotal: { type: Number, required: true },
  discount: { type: Number, required: true },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['razorpay', 'stripe', 'paypal', 'cod'], default: 'razorpay' },
  transactionId: { type: String }, // from payment gateway
   razorpayOrderId: {type:String},
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
