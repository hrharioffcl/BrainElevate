const user = require("../models/userSchema")
const Cart = require("../models/cartSchema")
const Coupon = require("../models/couponSchema")
const Wishlist = require('../models/wishListSchema')
const { calculateSubTotal } = require("../utils/calculateSubTotal")

const { cloudinary } = require("../config/cloudinary");
const couponUsage = require("../models/couponUsageSchema")
const { validateCoupon } = require("../utils/validateCoupon")
const validator = require('validator')

const { isValidPhoneNumber } = require('libphonenumber-js');



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
//profile/wishlist
exports.getprofileWishlist = async (req, res) => {
    const userid = req.params._id
    const users = await user.findById(userid)
    const wishlist = await Wishlist.find({ userId: users._id })
        .populate('courseId', 'name author thumbnail price details');
    res.render('userWishlist', { user: users, wishlist })
}
//profile/purchase History
exports.getprofilePurchaseHistory = async (req, res) => {
    const userid = req.params._id
    const users = await user.findById(userid)
    res.render('userPurchaseHistory', { user: users, courses: [] })
}
//profile/cart
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


//edit Profile
exports.getEditProfile = async (req, res) => {
    const userid = req.params._id
    const users = await user.findById(userid)
    try {

        res.render('editProfile', { user: users, formData: null, fieldErrors: null })
    } catch (error) {
        res.send("error")

    }
}

exports.postUploadProfilePic = async (req, res) => {
    const userid = req.params._id;
    const users = await user.findById(userid);
    try {


        if (!req.file) {
            req.flash("error", "No file uploaded");
            return res.redirect(`/profile/${userid}/editProfile`);
        }
        if (users.profilepicId) {
            const result = await cloudinary.uploader.destroy(users.profilepicId);
            console.log("Delete result:", result);
        }


        const imageUrl = req.file.path || req.file.url;  // FIX HERE


        users.profilepic = imageUrl;
        users.profilepicId = req.file.filename; // REAL public_id

        console.log(imageUrl)
        console.log(users.profilepic)
        await users.save(); // important!

        req.flash("success", "Profile picture updated!");
        return res.redirect(`/profile/${userid}/editProfile`);

    } catch (error) {
        console.log("Upload Error:", error);
        req.flash("error", "Upload failed");
        return res.redirect(`/profile/${userid}/editProfile`);

    }
};

//update profile
exports.postUpdateProfile = async (req, res) => {
    const userid = req.params._id;
    const users = await user.findById(userid);
    const { fullName, country, code, phone, gender, iso } = req.body
    const cleanNumber = phone.trim();
    let formData = {}
    const fieldErrors = {}
    try {
        if (!/^[A-Za-z ]{4,30}$/.test(fullName)) {
            fieldErrors.invalidName = "Name must be 4–30 letters only."
            return res.render(`editProfile`, { formData: req.body, fieldErrors })
        }


        const validNUmber = isValidPhoneNumber(cleanNumber, iso)

        if (!validNUmber) {   // ISO: IN, US, SG, etc.
            fieldErrors.invalidNum = "Invalid phone number for selected country";
            return res.render(`editProfile`, { formData: req.body, fieldErrors })
        }

        users.fullName = fullName || users.fullName;
        users.location = country || users.location;
        users.countryCode = code || users.code;
        users.contactNumber = phone || users.contactNumber;
        users.gender = gender || users.gender



        await users.save()


        req.flash("success", "Profile updated Successfully !");
        return res.redirect(`/profile/${userid}/editProfile`);

    } catch (error) {
        console.log(error)
        res.render(`editProfile`, { formData: req.body, fieldErrors })
    }

}
