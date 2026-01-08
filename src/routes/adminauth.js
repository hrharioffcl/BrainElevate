const express = require("express")
const { verifyadmintoken } = require('../middlewaares/adminAuthMiddleware')
const { restrictauthadminaccess } = require('../middlewaares/restrictauthadminaccess')
const { 
  adminlogin, getadminlogin, getforgotpassword, 
  getverifyotp, getresetpassword, adminlogout 
} = require("../controllers/authcontrollers")

const { getsuperadmindashboard } = require("../controllers/admindashboard.controller")

const { 
  getmanageadmin, addadmin, deleteadmin, editadmin, 
  getaddadmin, geteditadmin 
} = require("../controllers/manageadmincontroller")

const { 
  getmanagestudents, deletestudent, 
  geteditstudent, editstudent 
} = require("../controllers/managestudentcontroller")



const { 
  adddetails, updatedetails, addchapter, 
  geteditchapter, editchapter, deletecourse, getcoursemanagement,
  getaddnewcourse, getupdatecourse,coursesettings, getaddnewchapter, 
  getcoupons, getaddcoupon, addcoupon, geteditcoupon, 
  editcoupon, deletecoupon, getcategory, getaddcategory ,addcategory,geteditcategory,editcategory,deletecategory
} = require("../controllers/managecoursecontroller")

const uploadCourseThumbnail= require("../middlewaares/uploadCourseThumbnail");
const {saveReturnToCreateCourse,saveReturnToUpdateCourse,saveReturnToCreateChapter,saveReturnToUpdateChapter} =require("../middlewaares/saveReturnToAdmin")
const {multerErrorHandlerCreateCourse,multerErrorHandlerUpdateCourse,multerErrorHandlerCreateChapter,multerErrorHandlerUpdateChapter}=require("../middlewaares/multerErrorHandlerAdmin")

const videoUploader = require("../middlewaares/videoUploader");

const router = express.Router()

//Auth
router.get("/login", restrictauthadminaccess, getadminlogin)
router.post("/login", adminlogin)

router.get('/forgot-password', restrictauthadminaccess, getforgotpassword)
router.get('/verify-otp', restrictauthadminaccess, getverifyotp)
router.get('/reset-password', getresetpassword)

router.get('/logout', adminlogout)


// Dashbooard
router.get('/superadmindashboard', verifyadmintoken, getsuperadmindashboard)

router.get("/managerdashboard", (req, res) => {
  res.send("Manager Dashboard — coming soon!");
});
router.get("/contributerdashboard", (req, res) => {
  res.send("Manager Dashboard — coming soon!");
});

// Admin Management
router.get('/manage-admin', verifyadmintoken, getmanageadmin)
router.get("/manage-admin/addadmin", getaddadmin)
router.post("/manage-admin/addadmin", addadmin)

router.get("/manage-admin/editadmin/:admin_id", geteditadmin)
router.post('/manage-admin/editadmin/:admin_id', editadmin)

router.post('/delete/:id', deleteadmin)


// Student Management
router.get('/manage-students', verifyadmintoken, getmanagestudents)
router.get('/edit-student/:id', geteditstudent)
router.post('/edit-student/:id', editstudent)
router.post('/deletestudent/:id', deletestudent)


// Course Management
router.get('/courses', getcoursemanagement)
router.get('/addnewcourse',saveReturnToCreateCourse,getaddnewcourse)
// router.post('/addnewcourse', adddetails)

router.get('/coursesmangement/update/:course_id',saveReturnToUpdateCourse, getupdatecourse)
// router.post('/coursesmangement/update/', updatedetails)

router.post('/coursesmangement/delete/:course_id', deletecourse)
router.post(
  "/addnewcourse",
  uploadCourseThumbnail.single("thumbnail"),multerErrorHandlerCreateCourse,
  adddetails
);

router.post(
  "/coursesmangement/update/:course_id",
  uploadCourseThumbnail.single("thumbnail"),multerErrorHandlerUpdateCourse,
  updatedetails
);


// Chapter Mnagement
router.get('/courses/:course_id/addchapter',saveReturnToCreateChapter, getaddnewchapter)
router.post(
  '/courses/:course_id/chapters/add',
  videoUploader.single("lectureVideo"),multerErrorHandlerCreateChapter,
  addchapter
);

router.get('/courses/:course_id/chapters/:chapter_id/edit',saveReturnToUpdateChapter, geteditchapter)
router.post(
  '/courses/:course_id/chapters/:chapter_id/edit',
  videoUploader.single("lectureVideo"),multerErrorHandlerUpdateChapter,
  editchapter
);


// Coupon Management
router.get('/courses/coupons', getcoupons)
router.get('/courses/coupons/new', getaddcoupon)
router.post('/courses/coupons/new', addcoupon)

router.get('/courses/coupons/:coupon_id/edit', geteditcoupon)
router.post('/courses/coupons/:coupon_id/edit', editcoupon)

router.post('/courses/coupons/:coupon_id/delete', deletecoupon)


// Category Management
router.get('/courses/categories', getcategory)
router.get('/courses/addcategory', getaddcategory)
router.get("/courses/categories/:categories_id/edit",geteditcategory)
router.post("/courses/addcategory",addcategory)
router.post("/courses/categories/:categories_id/edit",editcategory)
router.post("/courses/categories/:categories_id/delete",deletecategory)
module.exports = router
