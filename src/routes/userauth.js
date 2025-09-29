const express = require("express")
const { signup, verifyOtp, resendotp, login, forgotpassword, resetpassword } = require("../controllers/authcontrollers")
const{gethome} = require("../controllers/userHomeController")
const{getcourse}= require("../controllers/userCourseController")
const router = express.Router();
const { verifytoken } = require("../middlewaares/userAuthMiddleware");
const { restrictUnauthenticatedRoutes } = require("../middlewaares/restrictUserUnauthenticatedRoutes");
const { createReferralLink } = require("../middlewaares/refferallink");
const{softCheckUser}=require("../middlewaares/softcheckuser")




router.get('/', restrictUnauthenticatedRoutes, (req, res) => {
    res.render('homewithoutlogin',{referralLink:res.locals.referralLink||null})
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
    res.render('login', { fieldErrors: {}, formData: {} })
})
router.get('/forgot-password', restrictUnauthenticatedRoutes, (req, res) => {
    res.render('forgotpassword', { fieldErrors: {}, formData: {}, type: "user" })
})

router.get('/reset-password', restrictUnauthenticatedRoutes, (req, res) => {
    res.render('resetpassword', { fieldErrors: {} })
})
router.get('/home', verifytoken,createReferralLink,gethome )

router.get('/courses',getcourse)






router.post("/signup", restrictUnauthenticatedRoutes, signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendotp)
router.post('/login', restrictUnauthenticatedRoutes, login)
router.post('/forgot-password', forgotpassword)
router.post('/reset-password', resetpassword)

module.exports = router;