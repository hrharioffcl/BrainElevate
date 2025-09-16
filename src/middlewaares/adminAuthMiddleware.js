const jwt = require("jsonwebtoken")
const User = require("../models/adminschema");
const verifyadmintoken = async(req,res,next)=>{
const token =req.cookies.admin_jwt
if(!token){
return res.redirect('/admin/login')
}
try {
       const decoded = jwt.verify(token,process.env.JWT_SECRET)
           const admin = await User.findById(decoded.id).select("-password");
           if(!admin){
        return res.redirect('/admin/login')
    }
    req.admin =admin;
    console.log("running the admin authentication middleware")
    next()

} catch (error) {
    console.log(error)
    res.status(400).send("server error")
}
}

module.exports= {verifyadmintoken}