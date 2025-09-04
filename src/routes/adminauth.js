const express = require("express")
const{verifyadmintoken}= require('../middlewaares/adminAuthMiddleware')
const { adminlogin } = require("../controllers/authcontrollers")
const{getsuperadmindashboard}=require("../controllers/admindashboard.controller")
const{getmanageadmin,addadmin,deleteadmin}=require("../controllers/manageadmincontroller")
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
router.get('/superadmindashboard',verifyadmintoken,getsuperadmindashboard)


router.post("/login", adminlogin)



router.get('/manage-admin',verifyadmintoken,getmanageadmin)
router.post("/addadmin",addadmin);
router.post('/delete/:id',deleteadmin)

module.exports = router;