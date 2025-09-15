const express = require("express")
const { verifyadmintoken } = require('../middlewaares/adminAuthMiddleware')
const { adminlogin,getadminlogin,getforgotpassword,getverifyotp ,getresetpassword} = require("../controllers/authcontrollers")
const { getsuperadmindashboard } = require("../controllers/admindashboard.controller")
const { getmanageadmin, addadmin, deleteadmin, editadmin,getaddadmin,geteditadmin } = require("../controllers/manageadmincontroller")
const { getmanagestudents, deletestudent, geteditstudent, editstudent } = require("../controllers/managestudentcontroller")
const { adddetails, updatedetails, addchapter,geteditchapter,editchapter,deletecourse,getcoursemanagement,getaddnewcourse,getupdatecourse,getaddnewchapter} = require("../controllers/managecoursecontroller")
const User = require('../models/userSchema')
const admin = require('../models/adminschema')
const router = express.Router()
const courses = require("../models/coursesSchema")
const chapter = require("../models/chapterScheema")


//adminauthroutes
router.get("/login",getadminlogin )
router.get('/forgot-password',getforgotpassword )
router.get('/verify-otp',getverifyotp)
router.get('/reset-password',getresetpassword )
router.get('/superadmindashboard', verifyadmintoken, getsuperadmindashboard)

//manage-admin
router.get('/manage-admin', verifyadmintoken, getmanageadmin)
router.get("/manage-admin/addadmin",getaddadmin)
router.get("/manage-admin/editadmin/:admin_id",geteditadmin)

//manage -course
router.get('/manage-students', verifyadmintoken, getmanagestudents)
router.get('/edit-student/:id', geteditstudent)
router.get('/courses',getcoursemanagement )
router.get('/addnewcourse', getaddnewcourse)
router.get('/coursesmangement/update/:course_id', getupdatecourse)
router.get('/courses/:course_id/addchapter',getaddnewchapter);
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