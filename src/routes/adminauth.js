const express = require("express")
const{verifyadmintoken}= require('../middlewaares/adminAuthMiddleware')
const { adminlogin } = require("../controllers/authcontrollers")
const{getsuperadmindashboard}=require("../controllers/admindashboard.controller")
const{getmanageadmin,addadmin,deleteadmin,editadmin}=require("../controllers/manageadmincontroller")
const{getmanagestudents,deletestudent,geteditstudent,editstudent}=require("../controllers/managestudentcontroller")
const{adddetails,updatedetails}=require("../controllers/managecoursecontroller")
const User= require('../models/userSchema')
const router = express.Router()
const courses = require("../models/coursesSchema")
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
router.get('/courses',async (req,res)=>{
const course =await courses.find()
    res.render('coursemanagemant',{search:null,course})
})
router.get('/addnewcourse',(req,res)=>{
    res.render('course-form',{course:null})
})
router.get('/coursesmangement/update/:id',async (req,res)=>{
    const id = req.params.id
    const course = await courses.findById(id)
    res.render('course-form',{course})
})



router.post("/login", adminlogin)
router.post("/addadmin",addadmin);
router.post('/delete/:id',deleteadmin)
router.post('/update/:id',editadmin)
router.post('/deletestudent/:id',deletestudent)
router.post('/edit-student/:id',editstudent)
router.post('/addnewcourse',adddetails)
router.post('/coursesmangement/update/:id',updatedetails)

module.exports = router;