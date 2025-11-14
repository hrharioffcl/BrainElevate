
const Cart = require('../models/cartSchema')
const cartItems = require('../models/cartItemSchema')
const Course = require('../models/coursesSchema')
const Coupon = require('../models/couponSchema')
const couponUsage = require("../models/couponUsageSchema")
const Wishlist = require('../models/wishListSchema')
const { validateCoupon } = require("../utils/validateCoupon")

exports.postBuyNow = async (req, res) => {
    const user = res.locals.user
    const { courseId } = req.body
    let course = await Course.findById(courseId)
    try {
        if (!user) {
            return res.redirect('/login')
        }

        let cart = await Cart.findOne({ cartUser: user._id })

        if (!cart) {
            cart = await Cart.create({ cartUser: user._id })
        }

        const existingItem = await cartItems.findOne({ cart: cart._id, course: course._id });
        if (existingItem) {
            return res.redirect(`/profile/${res.locals.user._id}/cart`);
        }


        const newItem = await cartItems.create({
            cart: cart._id,
            course: course._id,
            basePrice: course.price,
            finalPrice: 0
        })

        cart.items.push(newItem._id)
        await cart.save()


        res.redirect(`/profile/${user._id}/cart`)

    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong.');
        res.redirect(`/courses/${course._id}`);
    }


}





exports.addToCart = async (req, res) => {
    const user = res.locals.user
    const { courseId } = req.body
    let course = await Course.findById(courseId)
    try {
        if (!user) {
            return res.redirect('/login')
        }

        let cart = await Cart.findOne({ cartUser: user._id })

        if (!cart) {
            cart = await Cart.create({ cartUser: user._id })
        }

        const existingItem = await cartItems.findOne({ cart: cart._id, course: course._id });
        if (existingItem) {
            return res.redirect(`/profile/${res.locals.user._id}/cart`);
        }


        const newItem = await cartItems.create({
            cart: cart._id,
            course: course._id,
            basePrice: course.price,
            finalPrice: 0
        })

        cart.items.push(newItem._id)

        await cart.save()

        res.redirect(`/courses/${course._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong.');
        res.redirect(`/courses/${course._id}`);
    }


}








exports.removeItem = async (req, res) => {
    try {
        const { itemId } = req.body

        let user = res.locals.user

        let cart = await Cart.findOne({ cartUser: user._id })

        await Cart.updateOne({ cartUser: user._id }, { $pull: { items: itemId } })

        await cartItems.findByIdAndDelete(itemId)


        await cart.save()

        req.flash('success', 'Course removed from your cart!');
        res.redirect(`/profile/${user._id}/cart`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong.');
        res.redirect(`/profile/${res.locals.user._id}/cart`);
    }


}


exports.applyCoupon = async (req, res) => {
    let user = res.locals.user;
    const { couponCode } = req.body

    try {
        const cart = await Cart.findOne({ cartUser: user._id }).populate({
            path: 'items',
            populate: { path: 'course', model: 'Course' },
            select: 'name author thumbnail price details'
        })
        const coupon = await Coupon.findOne({ couponCode: couponCode })
        if (!coupon) {
            cart.appliedCoupon = null
            req.flash('error', 'Invalid or expired coupon.');
            return res.redirect(`/profile/${user._id}/cart`);
        }
        const userUsage = await couponUsage.findOne({ userId: user._id, couponId: coupon._id })

        const result = await validateCoupon(cart, coupon, user, userUsage)

        if (!result.valid) {
            cart.appliedCoupon = null;
            await cart.save();
            req.flash('error', result.message
            );
            return res.redirect(`/profile/${user._id}/cart`);
        }


        cart.appliedCoupon = coupon._id
        await cart.save();
        req.flash('success', `Coupon applied successfully!`);
        res.redirect(`/profile/${user._id}/cart`);

    } catch (error) {
        console.log(error)
        req.flash('error', `Some error occured`);
        res.redirect(`/profile/${user._id}/cart`);
    }

}

exports.removeCoupon = async (req, res) => {
    try {
        const { cartId } = req.body
        let user = res.locals.user

        const cart = await Cart.findById(cartId)
        cart.appliedCoupon = null
        await cart.save()
        req.flash('success', 'Coupon removed!');

        res.redirect(`/profile/${user._id}/cart`);
    } catch (error) {
        console.log(error)
        req.flash('error', `Some error occured`);
        res.redirect(`/profile/${user._id}/cart`);
    }

}



exports.addToWishList = async (req, res) => {
    const user = res.locals.user
    try {
        const { courseId,redirectTo } = req.body
        let course = await Course.findById(courseId)
        if (!user) {
            return res.redirect('/login')
        }
        const existing = await Wishlist.findOne({ userId: user._id, courseId: course._id })

        if (existing) {

            // Remove from wishlist
            await Wishlist.deleteOne({ _id: existing._id });
            req.flash("warning", "Removed from wishlist");

            console.log("Removed from wishlist");
        } else {
            // Add to wishlist
            await Wishlist.create({ userId: user._id, courseId: course._id });
req.flash('success', "Added to wishlist!");
            console.log("Added to wishlist");
        }


        res.redirect(redirectTo ||'/courses')

    } catch (error) {
        console.log(error)
    }

}