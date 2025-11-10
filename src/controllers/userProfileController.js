const user = require("../models/userSchema")
const Cart = require("../models/cartSchema")
const Coupon = require("../models/couponSchema")
const { calculateSubTotal } = require("../utils/calculateSubTotal")

const couponUsage = require("../models/couponUsageSchema")
const { validateCoupon } = require("../utils/validateCoupon")


exports.getprofiledashboard = async (req, res) => {
    const userid = req.params._id
    const users = await user.findById(userid)
    res.render('userProfile', { user: users, courses: [] })
}

exports.getprofileProgress = async (req, res) => {
    const userid = req.params._id
    const users = await user.findById(userid)
    res.render('userProgress', { user: users, courses: [] })
}

exports.getprofileWishlist = async (req, res) => {
    const userid = req.params._id
    const users = await user.findById(userid)
    res.render('userWishlist', { user: users, courses: [] })
}

exports.getprofilePurchaseHistory = async (req, res) => {
    const userid = req.params._id
    const users = await user.findById(userid)
    res.render('userPurchaseHistory', { user: users, courses: [] })
}

exports.getprofileCart = async (req, res) => {
    const userid = req.params._id
    const users = await user.findById(userid)

    let cart = await Cart.findOne({ cartUser: users._id }).populate({
        path: 'items',
        populate: { path: 'course', model: 'Course' },
        select: 'name author thumbnail price details'
    })
    if (!cart) {
        cart = await Cart.create({ cartUser: users._id })
    }

    const subTotal = await calculateSubTotal(cart._id);
    cart.subTotal = subTotal;
    cart.totalDiscount = 0;
    let coupon = null; // define it here so it's safely accessible later

    if (cart.appliedCoupon) {

    coupon = await Coupon.findById(cart.appliedCoupon);

        if (!coupon || coupon.isDeleted === true) {
            req.flash('error', 'Invalid Coupon');
            return res.redirect(`/profile/${users._id}/cart`);
        }

        const userUsage = await couponUsage.findOne({ userId: users._id, couponId: coupon._id })

        const validation = await validateCoupon(cart, coupon, user, userUsage);

        if (!validation.valid) {
            cart.appliedCoupon = null;
            await cart.save();
            req.flash('error', validation.message);
        } else {

            if (coupon.scope === 'global' && coupon.discountType === 'Amount') {
                cart.totalDiscount = coupon.discountValue
            }
            if (coupon.scope === 'global' && coupon.discountType === 'Percentage') {
                cart.totalDiscount = Math.min((subTotal * coupon.discountValue) / 100, coupon.maxDiscountAmount);
            }


        }
    }

    cart.total = subTotal - cart.totalDiscount;
    await cart.save()
    res.render('userCart', { user: users, cart ,coupon})
}