const user = require("../models/userSchema")
const Cart = require("../models/cartSchema")
const Coupon = require("../models/couponSchema")
const Wishlist = require('../models/wishListSchema')
const Enrollment = require("../models/enrollmentSchema")
const { calculateSubTotal } = require("../utils/calculateSubTotal")
const { cloudinary } = require("../config/cloudinary");
const couponUsage = require("../models/couponUsageSchema")
const { validateCoupon } = require("../utils/validateCoupon")
const validator = require('validator')
const { isValidPhoneNumber } = require('libphonenumber-js');

const Otp = require('../models/otp')
const sendOtp = require("../utils/sendotp")
const createOtpcode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const bcrypt = require("bcrypt")


exports.getprofiledashboard = async (req, res) => {
    const userid = req.user._id
    const users = await user.findById(userid)
    res.render('userProfile', { user: users, courses: [] })
}

//profile/my Learining

exports.getprofileProgress = async (req, res) => {
    try {
        const userId = req.user._id; // /profile/:id/mylearning
        const users = await user.findById(userId);

        // Which tab to show
        const view = req.query.view;

        // Fetch all enrollment documents for this student
        const enrollments = await Enrollment.find({ studentId: userId })
            .populate('courseId', 'name author thumbnail price details _id');

        // IN-PROGRESS COURSES
        const inProgressCourses = enrollments
            .filter(en => en.progress < 100)  // progress NOT completed
            .map(en => ({
                title: en.courseId.name,
                instructor: en.courseId.author,
                thumbnail: en.courseId.thumbnail,
                progress: en.progress,
                id: en.courseId._id,
                eid: en._id
            }));

        // COMPLETED COURSES
        const completedCourses = enrollments
            .filter(en => en.progress === 100)
            .map(en => ({
                title: en.courseId.name,
                instructor: en.courseId.author,
                thumbnail: en.courseId.thumbnail,
                progress: en.progress,
               eid: en._id
            }));

        res.render("userProgress", {
            user: users,
            view,
            inProgressCourses,
            completedCourses
        });

    } catch (e) {
        console.error(e);
        res.status(500).send("Server Error");
    }
};










//profile/wishlist
exports.getprofileWishlist = async (req, res) => {
    const userid = req.user._id
    const users = await user.findById(userid)
    const wishlist = await Wishlist.find({ userId: users._id })
        .populate('courseId', 'name author thumbnail price details');
    res.render('userWishlist', { user: users, wishlist })
}
//profile/purchase History
exports.getprofilePurchaseHistory = async (req, res) => {
    const userid = req.user._id
    const users = await user.findById(userid)
    res.render('userPurchaseHistory', { user: users, courses: [] })
}
//profile/cart
exports.getprofileCart = async (req, res) => {
    try {

        const userid = req.user._id
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
                return res.redirect(`/profile/${users.fullName}/cart`);
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
    const userid = req.user._id
    const users = await user.findById(userid)
    try {

        res.render('editProfile', { user: users, formData: null, fieldErrors: null })
    } catch (error) {
        res.send("error")

    }
}

exports.postUploadProfilePic = async (req, res) => {
    const userid = req.user._id;
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
        return res.redirect(`/profile/${users.fullName}/editProfile`);

    } catch (error) {
        console.log("Upload Error:", error);
        req.flash("error", "Upload failed");
        return res.redirect(`/profile/${users.fullName}/editProfile`);

    }
};

//update profile
exports.postUpdateProfile = async (req, res) => {
    const userid = req.user._id;
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
        return res.redirect(`/profile/${users.fullName}/editProfile`);

    } catch (error) {
        console.log(error)
        res.render(`editProfile`, { formData: req.body, fieldErrors })
    }

}

exports.changePassword = async (req, res) => {

    const userid = req.user._id;
    const users = await user.findById(userid);
    try {
        if (users.googleUser) {
            req.flash('error', "Google based login found!!")
            return res.redirect(`/profile/${users.fullName}/editProfile`);
        }



        const { currentPassword } = req.body
        const isMatch = await bcrypt.compare(currentPassword, users.password)
        if (isMatch) {
            //delete otp records
            await Otp.deleteMany({ email: users.email, purpose: "changeUserPassword" })
            //otp generate
            const otpcode = createOtpcode();
            const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

            await Otp.create({ email: users.email, otpcode, purpose: "changeUserPassword", expiresAt })

            //send dOTP via email
            await sendOtp(users.email, otpcode)


            //adding fullname password and email to session
            req.session.changeUserPassword = { email: users.email, purpose: "changeUserPassword" }



            await res.clearCookie("jwt", {

                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // only secure in prod
                sameSite: "strict",
            })



            console.log("redirecting to verify")
            res.redirect('/verify-otp')
        } else {
            req.flash('error', "Invalid password")
            return res.redirect(`/profile/${users.fullName}/editProfile`);
        }
    } catch (error) {
        console.log(error)
        req.flash('error', "Something Went Wrong")
        return res.redirect(`/profile/${users.fullName}/editProfile`);
    }

}


exports.deleteAccount = async (req, res) => {
    const userid = req.user._id;
    const users = await user.findById(userid);
    fieldErrors = {}
    formData = null
    try {
        const { agreeTerms, agreeBalance, agreeRefund, feedback, password } = req.body;
        if (!agreeTerms || !agreeBalance || !agreeRefund) {
            fieldErrors.deleteError = "Please agree to all the terms before deleting your account.";
            fieldErrors.openDeleteModal = true;
            return res.render(`editProfile`, { formData, fieldErrors })
        }
        if (!users.googleUser) {
            const isMatch = await bcrypt.compare(password, users.password);
            if (!isMatch) {
                fieldErrors.deleteError = "Incorrect password. Please try again.";
                fieldErrors.openDeleteModal = true;
                return res.render(`editProfile`, { formData, fieldErrors });
            }
        }

        if (feedback && feedback.trim() !== "") {
            users.feedBack = feedback
        }

        users.isDeleted = true;
        await users.save()


        res.clearCookie("jwt", {

            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // only secure in prod
            sameSite: "strict",
        })

        req.flash("success", "Account Deleted Successfully");
        res.redirect('/login')



    } catch (error) {
        console.log(error)
        fieldErrors.deleteError = "some error occured";
        fieldErrors.openDeleteModal = true;
        return res.render(`editProfile`, { formData, fieldErrors });
    }
}