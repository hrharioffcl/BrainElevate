const nodemailer = require("nodemailer")

const sendOtp = async (email,otpCode)=>{

    const transporter =nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,
        }
    })

    await transporter.sendMail({
        from:"no-reply@brainelevate.com",
        to:email,
        subject:"your otp code",
        text:`your OTP code is${otpCode},expires in 3 minutes`

    })
}

module.exports =sendOtp;