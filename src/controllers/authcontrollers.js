const User = require("../models/userSchema")
const otp = require("../models/otp")
const sendOtp = require("../utils/sendotp")
const usertoken = require("../utils/usertoken")

const createOtpcode = () => {
    Math.floor(100000 + Math.random() * 900000).toString();
}
//SIGNUP ROUTE
exports.signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existinguser = await User.findOne({ email });
        if (existinguser) return res.status(400).send("user already exist")
        await otp.deleteMany({ email, purpose: "signup" })
        //otp generate
        const otpcode = createOtpcode();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

        await otp.create({ email, otpcode, purpose: "signup", expiresAt })
        //send dOTP via email
        await sendOtp(email, otpcode)
        res.status(200).send("otp send to mail")

    } catch (error) {
        console.log(error)
        res.status(500).send("error signing up")
    }
}

exports.verifyOtp =async(req,res)=>{
try {
    const {fullname,email,password,otp}= req.body;
    const otpRecord = await Otp.findOne({email,purpose:"signup"}).sort({createdAT:-1})
if(otpRecord.otpcode!=otp){
    res.status(400).send("invalid otp")
}
///create user if otp verified
const user = await User.create({fullName,email,password,isVerified:true})
} catch (error) {
    
}

}
