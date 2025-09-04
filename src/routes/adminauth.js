const express = require("express")
const{verifyadmintoken}= require('../middlewaares/adminAuthMiddleware')
const { adminlogin } = require("../controllers/authcontrollers")
const{getsuperadmindashboard}=require("../controllers/admindashboard.controller")
const{getmanageadmin,addadmin,deleteadmin,editadmin}=require("../controllers/manageadmincontroller")
const{getmanagestudents,deletestudent,geteditstudent,editstudent}=require("../controllers/managestudentcontroller")
const User= require('../models/userSchema')
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


router.get('/edit-student/:id',geteditstudent)
router.get('/manage-admin',verifyadmintoken,getmanageadmin)
router.get('/manage-students',verifyadmintoken,getmanagestudents)


router.post("/login", adminlogin)
router.post("/addadmin",addadmin);
router.post('/delete/:id',deleteadmin)
router.post('/update/:id',editadmin)
router.post('/deletestudent/:id',deletestudent)
router.post('/edit-student/:id',editstudent)

module.exports = router;