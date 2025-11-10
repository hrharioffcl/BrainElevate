const express = require("express")
const { signup, verifyOtp, resendotp, login, forgotpassword, resetpassword ,userLogOut} = require("../controllers/authcontrollers")
const{gethome} = require("../controllers/userHomeController")
const{getcourse,getcoursedetails}= require("../controllers/userCourseController")
const router = express.Router();
const { verifytoken } = require("../middlewaares/userAuthMiddleware");
const { restrictUnauthenticatedRoutes } = require("../middlewaares/restrictUserUnauthenticatedRoutes");
const { createReferralLink } = require("../middlewaares/refferallink");
const{softCheckUser}=require("../middlewaares/softcheckuser")
const{getprofiledashboard,getprofileProgress,getprofileWishlist,getprofilePurchaseHistory,getprofileCart}= require("../controllers/userProfileController")
const{postBuyNow,removeItem,applyCoupon,removeCoupon}=require('../controllers/cartController')


router.get('/', restrictUnauthenticatedRoutes, (req, res) => {
    const token = req.cookies.jwt
    res.render('homewithoutlogin',{referralLink:res.locals.referralLink||null,token})
})
router.get('/career',(req,res)=>{
    res.render("career", );

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
    fieldErrors={}
    if (req.query.error === "blocked") {
        fieldErrors.email ="Account blocked please contact Helpline"
    }
    res.render('login', { fieldErrors, formData: {} })
})
router.get('/forgot-password', restrictUnauthenticatedRoutes, (req, res) => {
    res.render('forgotpassword', { fieldErrors: {}, formData: {}, type: "user" })
})

router.get('/reset-password', restrictUnauthenticatedRoutes, (req, res) => {
    res.render('resetpassword', { fieldErrors: {} })
})
router.get('/home', verifytoken,createReferralLink,gethome )

router.get('/courses',softCheckUser,getcourse)

router.get('/courses/:_id',getcoursedetails)
router.get('/profile/:_id/dashboard',verifytoken,getprofiledashboard)
router.get('/profile/:_id/myLearning',verifytoken,getprofileProgress)
router.get('/profile/:_id/wishlist',verifytoken,getprofileWishlist)
router.get('/profile/:_id/hiStory',verifytoken,getprofilePurchaseHistory)
router.get('/profile/:_id/cart',verifytoken,getprofileCart)
router.get('/logout', userLogOut)


router.post("/signup", restrictUnauthenticatedRoutes, signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendotp)
router.post('/login', restrictUnauthenticatedRoutes, login)
router.post('/forgot-password', forgotpassword)
router.post('/reset-password', resetpassword)
router.post('/buyNow',verifytoken,postBuyNow)
router.post("/cart/remove",verifytoken,removeItem)
router.post("/applyCoupon",applyCoupon)
router.post('/removeCoupon',removeCoupon)

module.exports = router;