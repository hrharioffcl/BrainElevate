const User = require("../models/userSchema")
const Cart = require("../models/cartSchema")
const cartItem = require("../models/cartItemSchema")
const Razorpay = require("razorpay");
const Enrollment = require('../models/enrollmentSchema')
const Order = require("../models/orderSchema")
const couponUsage = require("../models/couponUsageSchema")
const coupon = require("../models/couponSchema")
const mongoose = require('mongoose')
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require('fs')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,       // from step 1
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.getChekoutPage = async (req, res) => {
  try {
    const userid = req.params._id
    const user = await User.findById(userid);

    let cart = await Cart.findOne({ cartUser: user._id }).populate({
      path: 'items',
      populate: { path: 'course', model: 'Course' },
      select: 'name author thumbnail price details'
    })
    if (!cart) {
      req.flash('error', 'Your Cart is Empty');
      return res.redirect(`/profile/${user._id}/cart`);
    }

    if (cart.items.length === 0) {
      req.flash('error', 'Your Cart is Empty');
      return res.redirect(`/profile/${user._id}/cart`);
    }
    res.render('checkOut', { cart, user })

  } catch (error) {
    console.log(error)
  }
}



// routes/payment.js or your controller

exports.createOrder = async (req, res) => {

  try {
    const { amount, userId, cartId } = req.body; // amount in rupees
    console.log(amount, userId, cartId);
  let cart = await Cart.findById(cartId).populate({
      path: 'items',
      populate: { path: 'course', model: 'Course' },
      select: 'name author thumbnail price details'
    })  

       console.log("COURSES USED IN ORDER:", cart.items.map(i => i.course.name));
     const user = await User.findById(userId)
    const options = {
      amount: parseInt(amount )* 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const razorOrder = await razorpay.orders.create(options);
    console.log(razorOrder)
    //order creation
    const order = await Order.create({
      user: userId,
      cart: cartId,
  items: cart.items.map(cartItem => cartItem.course._id),  // ← FIXED!,
      razorpayOrderId: razorOrder.id,
      subTotal: cart.subTotal,
      discount: cart.totalDiscount,
      totalAmount: cart.total,
      paymentStatus: "pending",
      paymentMethod: "razorpay",
      transactionId: null,

    });
    console.log(order)
    res.json({
      success: true,
      razorOrder,
      localOrderId: order._id
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Order creation failed" });
  }
};


exports.verifyPayment = async (req, res) => {
  const crypto = require("crypto");

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    cartId,
    userId,
    localOrderId
  } = req.body;

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
console.log(process.env.RAZORPAY_KEY_SECRET)
console.log(expectedSignature)
console.log(razorpay_signature)
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
     console.log("is auhtenticc")
      // Fetch payment status from Razorpay (optional but recommended)
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      if (payment.status !== "captured") {
        await Order.findByIdAndUpdate(localOrderId, {
          paymentStatus: "failed",
          transactionId: razorpay_payment_id,
          failureReason: "Payment not captured"
        });
        return res.json({ success: false, message: "Payment not captured" });
      }

      const cart = await Cart.findById(cartId).populate({
        path: 'items',
        populate: { path: 'course', model: 'Course' }
      });

      // Create enrollments
      const enrollments = [];
      for (const item of cart.items) {
        const enrollment = await Enrollment.create({
          studentId: userId,
          courseId: item.course._id,
        });
        enrollments.push(enrollment);
      }
if (cart.appliedCoupon) {

  await Coupon.findByIdAndUpdate(
    cart.appliedCoupon,
    { $inc: { couponQuantity: -1 } }
  );

  await couponUsage.findOneAndUpdate(
    {
      userId: userId,
      couponId: cart.appliedCoupon
    },
    {
      $inc: { usageCount: 1 }
    },
    {
      upsert: true,
      new: true
    }
  );

}





      // Clear cart

      cart.items = [];
await cartItem.deleteMany({cart:cartId})
      await cart.save();

      // Update order as paid
      await Order.findByIdAndUpdate(localOrderId, {
        paymentStatus: "paid",
        transactionId: razorpay_payment_id,
      });

      return res.json({ success: true });
    } else {
      await Order.findByIdAndUpdate(localOrderId, {
        paymentStatus: "failed",
        transactionId: razorpay_payment_id || null,
        failureReason: "Invalid signature"
      });
      return res.json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);

    await Order.findByIdAndUpdate(localOrderId, {
      paymentStatus: "failed",
      transactionId: razorpay_payment_id || null,
      failureReason: error.message
    });

    return res.json({ success: false, message: "Server error" });
  }
};


exports.getPaymentSuccess = async (req, res) => {
  const orderId = req.query.orderId
  try {
    const order = await Order.findById(orderId)
      .populate({
        path: 'items',
        select: 'name author',
      })
      .select('items totalAmount _id createdAt transactionId')
      .lean();

    if (!order) {
      return res.status(404).send('Order not found');
    }

    res.render('PaymentSuccessPage', { order })
  } catch (error) {
    console.log(error)
  }

}






const puppeteer = require("puppeteer");
const ejs = require("ejs");
const { url } = require("inspector");

exports.downloadReceipt = async (req, res) => {
  const order = await Order.findById(req.params._id)
    .populate("items")
    .populate("user");
    
  const logoPath = path.join(__dirname, "../public/images/logo.png");
  const logoBase64 = fs.readFileSync(logoPath, "base64");

  const html = await ejs.renderFile(
    path.join(__dirname, "../views/receiptTemplate.ejs"),
    {
      order,
      logo: `data:image/png;base64,${logoBase64}`
    }
  );

 

 

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true
  });

  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt_${order._id}.pdf`
  );

  res.send(pdf);
};
