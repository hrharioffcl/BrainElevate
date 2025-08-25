const express= require ("express")
const{signup,verifyOtp,resendotp}= require("../controllers/authcontrollers")
const router = express.Router();
router.get('/signup',(req,res)=>{
res.render('signup')
})
router.get('/verify-otp',(req,res)=>{
    res.render('otp')
})
router.post("/signup",signup);
router.post("/verify-otp",verifyOtp);
router.post("/resend-otp",resendotp)

module.exports=router;