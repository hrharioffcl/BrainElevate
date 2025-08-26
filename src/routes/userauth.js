const express= require ("express")
const{signup,verifyOtp,resendotp, login, forgotpassword}= require("../controllers/authcontrollers")
const router = express.Router();
router.get('/signup',(req,res)=>{
res.render('signup', { fieldErrors: {}, formData: {} })
})
router.get('/verify-otp',(req,res)=>{
    res.render('otp',{errorMessage:null})
})

router.get('/login',(req,res)=>{
    res.render('login',{ fieldErrors: {}, formData: {} })
})
router.get('/forgot-password',(req,res)=>{
    res.render('forgotpassword',{ fieldErrors: {}, formData: {} })
})

router.post("/signup",signup);
router.post("/verify-otp",verifyOtp);
router.post("/resend-otp",resendotp)
router.post('/login',login)
router.post('/forgot-password',forgotpassword)

module.exports=router;