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
    try {

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
        let coupon = null;

        if (cart.appliedCoupon) {

            coupon = await Coupon.findById(cart.appliedCoupon);
            if (!coupon) {
                cart.appliedCoupon = null
                req.flash('error', 'Invalid or expired coupon.');
                return res.redirect(`/profile/${user._id}/cart`);
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

                if (coupon.scope === 'coursespecific') {
                    let maxCourseDiscount = 0;
                    for (const item of cart.items) {
                        const course = item.course
                        if (coupon.courseId.some((Id) => {
                            return Id.equals(course._id)
                        })) {
                            let courseDiscount = 0;
                            if (coupon.discountType === 'Amount') {
                                courseDiscount = coupon.discountValue;
                            } else if (coupon.discountType === 'Percentage') {
                                courseDiscount = Math.min(
                                    (course.price * coupon.discountValue) / 100,
                                    coupon.maxDiscountAmount);
                            }
                            if (courseDiscount > maxCourseDiscount) {
                                maxCourseDiscount = courseDiscount
                            }
                        }
                    }

                    cart.totalDiscount = maxCourseDiscount;

                }

            }
        }

        cart.total = subTotal - cart.totalDiscount;
        await cart.save()
        res.render('userCart', { user: users, cart, coupon })
    } catch (error) {
        console.log(error)
    }
}