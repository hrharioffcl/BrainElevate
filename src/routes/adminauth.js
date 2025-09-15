const express = require("express")
const { verifyadmintoken } = require('../middlewaares/adminAuthMiddleware')
const { adminlogin } = require("../controllers/authcontrollers")
const { getsuperadmindashboard } = require("../controllers/admindashboard.controller")
const { getmanageadmin, addadmin, deleteadmin, editadmin } = require("../controllers/manageadmincontroller")
const { getmanagestudents, deletestudent, geteditstudent, editstudent } = require("../controllers/managestudentcontroller")
const { adddetails, updatedetails, addchapter,geteditchapter,editchapter,deletecourse} = require("../controllers/managecoursecontroller")
const User = require('../models/userSchema')
const admin = require('../models/adminschema')
const router = express.Router()
const courses = require("../models/coursesSchema")
const chapter = require("../models/chapterScheema")
router.get("/login", (req, res) => {

    res.render("adminlogin", { fieldErrors: {} })
})
router.get('/forgot-password', (req, res) => {
    res.render('forgotpassword', { fieldErrors: {}, formData: {}, type: "admin" })
})
router.get('/verify-otp', (req, res) => {
    res.render('otp', { errorMessage: null })
})
router.get('/reset-password', (req, res) => {
    res.render('resetpassword', { fieldErrors: {} })
})
router.get('/superadmindashboard', verifyadmintoken, getsuperadmindashboard)


router.get('/edit-student/:id', geteditstudent)
router.get('/manage-admin', verifyadmintoken, getmanageadmin)
router.get("/manage-admin/addadmin",async(req,res)=>{
    res.render('addadmin')
})
router.get("/manage-admin/editadmin/:admin_id",async(req,res)=>{
    const {admin_id}= req.params;
    const existingadmin = await admin.findById(admin_id)
    res.render('editadmin',{admin:existingadmin})
})
router.get('/manage-students', verifyadmintoken, getmanagestudents)
router.get('/courses', async (req, res) => {
    const course = await courses.find()
    res.render('coursemanagemant', { search: null, course })
})
router.get('/addnewcourse', (req, res) => {
    res.render('course-form', { course: null,existingchapater:null })
})
router.get('/coursesmangement/update/:course_id', async (req, res) => {
    const id = req.params.course_id
    const course = await courses.findById(id)
    const existingchapater = await chapter.find({courseId:id})
    res.render('course-form', { course,existingchapater })
})

router.get('/courses/:course_id/addchapter', async (req, res) => {
    const course = await courses.findById(req.params.course_id);

    if (!course) {
        req.flash("error", "Course not found");
        return res.redirect("/admin/courses");
    }

    res.render('addnewchapter', { course,existingchapater:null });
});

router.get('/courses/:course_id/chapters/:chapter_id/edit', geteditchapter);

router.post("/login", adminlogin)
router.post("/manage-admin/addadmin", addadmin);
router.post('/delete/:id', deleteadmin)
router.post('/manage-admin/editadmin/:admin_id', editadmin)
router.post('/deletestudent/:id', deletestudent)
router.post('/edit-student/:id', editstudent)
router.post('/addnewcourse', adddetails)
router.post('/coursesmangement/update/:course_id', updatedetails)
router.post('/courses/:course_id/chapters/add',addchapter)
router.post('/courses/:course_id/chapters/:chapter_id/edit',editchapter)
router.post('/admin/coursesmangement/delete/:course_id',deletecourse)
module.exports = router;