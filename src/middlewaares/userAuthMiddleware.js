const jwt = require("jsonwebtoken")
const User = require("../models/userSchema");
const verifytoken = async(req,res,next)=>{
const token =req.cookies.jwt
if(!token){
    return res.redirect('/login')
}
try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password");
    if(!user){
        return res.redirect('login')
    }
    req.user =user;
    console.log("running the mauthentication middleware")
    next()
} catch (error) {
    console.log(error)
    res.status(500).send("Server errror")
}

}

module.exports = {verifytoken};