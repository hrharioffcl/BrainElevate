const User = require("../models/userSchema")
const Cart = require("../models/cartSchema")
const Razorpay = require("razorpay");

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
       
if (cart.items.length===0) {
            req.flash('error', 'Your Cart is Empty');
            return res.redirect(`/profile/${user._id}/cart`);
        }
        res.render('checkOut', { cart,user  })

    } catch (error) {
        console.log(error)
    }
}



// routes/payment.js or your controller

exports.createOrder = async (req, res) => {
    const { amount, currency } = req.body; // amount in paise, currency like INR
    const options = {
        amount: amount, 
        currency: currency,
        receipt: `receipt_order_${Date.now()}`,
    };
    try {
        const order = await razorpay.orders.create(options);
        
        res.send(order); // send order info back to client
    } catch (err) {
        console.log(err);
        res.status(500).send("Error creating order");
    }
};
