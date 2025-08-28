const express = require("express")
const { signup, verifyOtp, resendotp, login, forgotpassword, resetpassword } = require("../controllers/authcontrollers")
const router = express.Router();
const { verifytoken } = require("../middlewaares/userAuthMiddleware");
const { restrictUnauthenticatedRoutes } = require("../middlewaares/restrictUserUnauthenticatedRoutes");

router.get('/signup',restrictUnauthenticatedRoutes, (req, res) => {
    res.render('signup', { fieldErrors: {}, formData: {} })
})
router.get('/verify-otp',restrictUnauthenticatedRoutes, (req, res) => {
    res.render('otp', { errorMessage: null })
})

router.get('/login',restrictUnauthenticatedRoutes, (req, res) => {
    res.render('login', { fieldErrors: {}, formData: {} })
})
router.get('/forgot-password', restrictUnauthenticatedRoutes,(req, res) => {
    res.render('forgotpassword', { fieldErrors: {}, formData: {} })
})

router.get('/reset-password',restrictUnauthenticatedRoutes, (req, res) => {
    res.render('resetpassword', { fieldErrors: {} })
})
router.get('/home', verifytoken, (req, res) => {

    res.render('home', { fullName: req.user.fullName })
})
router.post("/signup",restrictUnauthenticatedRoutes, signup);
router.post("/verify-otp",restrictUnauthenticatedRoutes, verifyOtp);
router.post("/resend-otp",restrictUnauthenticatedRoutes, resendotp)
router.post('/login',restrictUnauthenticatedRoutes, login)
router.post('/forgot-password',restrictUnauthenticatedRoutes, forgotpassword)
router.post('/reset-password',restrictUnauthenticatedRoutes, resetpassword)

module.exports = router;