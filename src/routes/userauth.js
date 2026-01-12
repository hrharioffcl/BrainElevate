const express = require("express")
const { signup, verifyOtp, resendotp, login, forgotpassword, resetpassword, userLogOut } = require("../controllers/authcontrollers")
const { gethome } = require("../controllers/userHomeController")
const { getcourse, getcoursedetails, getBoughtCourse, tryFreeCourse, postAddReview, getViewChapter, updateChapterProgress,continueLearning } = require("../controllers/userCourseController")
const router = express.Router();
const { verifytoken } = require("../middlewaares/userAuthMiddleware");
const { restrictUnauthenticatedRoutes } = require("../middlewaares/restrictUserUnauthenticatedRoutes");
const { createReferralLink } = require("../middlewaares/refferallink");
const { softCheckUser } = require("../middlewaares/softcheckuser")
const uploadProfilePic = require("../middlewaares/uploadProfilePic");
const { getprofiledashboard, getprofileProgress, getprofileWishlist, getprofilePurchaseHistory,
    getprofileCart, getEditProfile, postUploadProfilePic,
    postUpdateProfile, changePassword, deleteAccount } = require("../controllers/userProfileController")


const { postBuyNow, addToCart, removeItem, applyCoupon, removeCoupon, addToWishList } = require('../controllers/cartController')

const { getChekoutPage, createOrder, verifyPayment, getPaymentSuccess, downloadReceipt } = require('../controllers/paymentController')

const { saveReturnToUser } = require("../middlewaares/saveReturnToUser")

const multerErrorHandlerUser = require("../middlewaares/multerErrorHandlerUser");

router.get('/', restrictUnauthenticatedRoutes, (req, res) => {
    const token = req.cookies.jwt
    res.render('homewithoutlogin', { referralLink: res.locals.referralLink || null, token })
})
router.get('/career', (req, res) => {
    res.render("career",);

})

router.get('/signup', restrictUnauthenticatedRoutes, (req, res) => {
    //addding refferal code to session if exist
    if (req.query.ref) {
        console.log("Referral detected:", req.query.ref)  // DEBUG

        req.session.referral = req.query.ref
    }
    res.render('signup', { fieldErrors: {}, formData: {} })
})
router.get('/verify-otp', restrictUnauthenticatedRoutes, (req, res) => {
    res.render('otp', { errorMessage: null })
})

router.get('/login', restrictUnauthenticatedRoutes, (req, res) => {
    let fieldErrors = {};
    const error = req.query.error;

    if (error === "blocked") {
        fieldErrors.email = "Account blocked. Please contact support.";
    }
    else if (error === "notfound") {
        fieldErrors.email = "Account not found.";
    }
    else if (error === "manual") {
        fieldErrors.email = "Please sign in using email & password.";
    }
    else if (error === "server") {
        fieldErrors.email = "Something went wrong. Please try again.";
    }
    else if (error === "unknown") {
        fieldErrors.email = "Unable to login. Try again.";
    }

    res.render('login', { fieldErrors, formData: {} });
});


router.get('/forgot-password', restrictUnauthenticatedRoutes, (req, res) => {
    res.render('forgotpassword', { fieldErrors: {}, formData: {}, type: "user" })
})

router.get('/reset-password', restrictUnauthenticatedRoutes, (req, res) => {
    res.render('resetpassword', { fieldErrors: {} })
})
router.get('/home', verifytoken, createReferralLink, gethome)

router.get('/courses', softCheckUser, getcourse)

router.get('/courses/:slug', getcoursedetails)
router.get('/profile/:fullName/dashboard', verifytoken, getprofiledashboard)
router.get('/profile/:_id/myLearning', verifytoken, getprofileProgress)
router.get('/profile/:_id/wishlist', verifytoken, getprofileWishlist)
router.get('/profile/:_id/hiStory', verifytoken, getprofilePurchaseHistory)
router.get('/profile/:_id/cart', verifytoken, getprofileCart)
router.get('/logout', userLogOut)
router.get('/profile/:_id/editProfile', saveReturnToUser, verifytoken, getEditProfile)
router.get('/profile/:_id/cart/checkOut', verifytoken, getChekoutPage)
router.get('/payment-success', verifytoken, getPaymentSuccess)
router.get("/order/:_id/receipt", verifytoken, downloadReceipt)
router.get('/profile/:_id/myLearning/:slug/:eid', verifytoken, getBoughtCourse)
router.get('/profile/:fullName/myLearning/:slug/:eid/continue',verifytoken,continueLearning)
router.get('/profile/:fullName/myLearning/:slug/:eid/:chapterId', verifytoken, getViewChapter)




router.post("/signup", restrictUnauthenticatedRoutes, signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendotp)
router.post('/login', restrictUnauthenticatedRoutes, login)
router.post('/forgot-password', forgotpassword)
router.post('/reset-password', resetpassword)
router.post('/buyNow', verifytoken, postBuyNow)
router.post('/addToCart', verifytoken, addToCart)
router.post("/cart/remove", verifytoken, removeItem)
router.post("/applyCoupon", verifytoken, applyCoupon)
router.post('/removeCoupon', verifytoken, removeCoupon)
router.post('/addToWishList', verifytoken, addToWishList)
router.post(
    "/profile/upload-photo/:_id",
    uploadProfilePic.single("profile"), verifytoken, multerErrorHandlerUser,
    postUploadProfilePic
);

router.post('/profile/:_id/update', verifytoken, postUpdateProfile)
router.post('/profile/:_id/updatePassword', verifytoken, changePassword)
router.post('/profile/:_id/deleteAccount', verifytoken, deleteAccount)
router.post('/create-order', verifytoken, createOrder)
router.post("/verify-payment", verifytoken, verifyPayment);
router.post('/tryFreeCourse', tryFreeCourse)
router.post('/course/:courseName/review', postAddReview)

router.post(
    "/api/progress/chapter",
    verifytoken,
    updateChapterProgress
);





// ADD THIS ANYWHERE BEFORE module.exports = router;
router.get('/razorpay-key', (req, res) => {
    if (!process.env.RAZORPAY_KEY_ID) {
        return res.status(500).json({ error: "Razorpay key not configured" });
    }
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
