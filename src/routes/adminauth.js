const express = require("express")
const { verifyadmintoken} = require('../middlewaares/adminAuthMiddleware')
const { restrictauthadminaccess } = require('../middlewaares/restrictauthadminaccess')
const {authorizeRoles}=require("../middlewaares/authorizeAdminRoles")
const { 
  adminlogin, getadminlogin, getforgotpassword, 
  getverifyotp, getresetpassword, adminlogout 
} = require("../controllers/authcontrollers")

const { getsuperadmindashboard ,getContributorDashboard} = require("../controllers/admindashboard.controller")

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
  editcoupon, deletecoupon, getcategory, getaddcategory ,addcategory,geteditcategory,editcategory,deletecategory,getContributorCourses
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
router.get('/superadmindashboard',authorizeRoles('super_admin'),getsuperadmindashboard)

router.get("/managerdashboard", (req, res) => {
  res.send("Manager Dashboard — coming soon!");
});
router.get(
    '/contributor/contributorDashBoard',authorizeRoles('contributor'),
   getContributorDashboard
);

// Admin Management
router.get('/manage-admin',authorizeRoles('super_admin'), getmanageadmin)
router.get("/manage-admin/addadmin",authorizeRoles('super_admin'), getaddadmin)
router.post("/manage-admin/addadmin",authorizeRoles('super_admin'), addadmin)

router.get("/manage-admin/editadmin/:admin_id",authorizeRoles('super_admin'), geteditadmin)
router.post('/manage-admin/editadmin/:admin_id',authorizeRoles('super_admin'), editadmin)

router.post('/delete/:id',authorizeRoles('super_admin'), deleteadmin)


// Student Management
router.get('/manage-students',authorizeRoles('super_admin'),getmanagestudents)
router.get('/edit-student/:id',authorizeRoles('super_admin'), geteditstudent)
router.post('/edit-student/:id',authorizeRoles('super_admin'), editstudent)
router.post('/deletestudent/:id',authorizeRoles('super_admin'), deletestudent)


// Course Management
router.get('/courses',authorizeRoles('super_admin',), getcoursemanagement)
router.get('/addnewcourse',authorizeRoles('super_admin','contributor'),saveReturnToCreateCourse,getaddnewcourse)
// router.post('/addnewcourse', adddetails)

router.get('/coursesmangement/update/:course_id',authorizeRoles('super_admin','contributor'),saveReturnToUpdateCourse, getupdatecourse)
// router.post('/coursesmangement/update/', updatedetails)

router.post('/coursesmangement/delete/:course_id',authorizeRoles('super_admin'), deletecourse)
router.post(
  "/addnewcourse",authorizeRoles('super_admin','contributor'),
  uploadCourseThumbnail.single("thumbnail"),multerErrorHandlerCreateCourse,
  adddetails
);

router.post(
  "/coursesmangement/update/:course_id",authorizeRoles('super_admin','contributor'),
  uploadCourseThumbnail.single("thumbnail"),multerErrorHandlerUpdateCourse,
  updatedetails
);


// Chapter Mnagement
router.get('/courses/:course_id/addchapter',authorizeRoles('super_admin','contributor'),saveReturnToCreateChapter, getaddnewchapter)
router.post(
  '/courses/:course_id/chapters/add',authorizeRoles('super_admin','contributor'),
  videoUploader.single("lectureVideo"),multerErrorHandlerCreateChapter,
  addchapter
);

router.get('/courses/:course_id/chapters/:chapter_id/edit',authorizeRoles('super_admin','contributor'),saveReturnToUpdateChapter, geteditchapter)
router.post(
  '/courses/:course_id/chapters/:chapter_id/edit',
  videoUploader.single("lectureVideo"),authorizeRoles('super_admin','contributor'),multerErrorHandlerUpdateChapter,
  editchapter
);



//contributers
router.get(
    '/contributor/my-courses',
    authorizeRoles('contributor'),
    getContributorCourses
);

// Coupon Management
router.get('/courses/coupons',authorizeRoles('super_admin'), getcoupons)
router.get('/courses/coupons/new',authorizeRoles('super_admin'), getaddcoupon)
router.post('/courses/coupons/new',authorizeRoles('super_admin'),addcoupon)

router.get('/courses/coupons/:coupon_id/edit',authorizeRoles('super_admin'),geteditcoupon)
router.post('/courses/coupons/:coupon_id/edit', editcoupon)

router.post('/courses/coupons/:coupon_id/delete',authorizeRoles('super_admin'), deletecoupon)


// Category Management
router.get('/courses/categories', authorizeRoles('super_admin'),getcategory)
router.get('/courses/addcategory',authorizeRoles('super_admin'), getaddcategory)
router.get("/courses/categories/:categories_id/edit",geteditcategory)
router.post("/courses/addcategory",authorizeRoles('super_admin'),addcategory)
router.post("/courses/categories/:categories_id/edit",authorizeRoles('super_admin'),editcategory)
router.post("/courses/categories/:categories_id/delete",authorizeRoles('super_admin'),deletecategory)
module.exports = router
