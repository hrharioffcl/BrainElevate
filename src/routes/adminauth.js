const express = require("express")
const { adminlogin } = require("../controllers/authcontrollers")
const{getsuperadmindashboard}=require("../controllers/admindashboard.controller")
const router = express.Router()

router.get("/login", (req, res) => {

    res.render("adminlogin", { fieldErrors: {} })
})
router.get('/forgot-password', (req, res) => {
    res.render('forgotpassword', { fieldErrors: {}, formData: {}, type: "admin" })
})
router.get('/verify-otp', (req,res) => {
    res.render('otp', { errorMessage: null })
})
router.get('/reset-password', (req, res) => {
    res.render('resetpassword', { fieldErrors: {} })
})
router.get('/superadmindashboard',getsuperadmindashboard)
router.post("/login", adminlogin)


module.exports = router;