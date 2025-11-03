const user = require("../models/userSchema")


exports.getprofile = async (req,res)=>{
    const userid = req.params._id
    const users= await user.findById(userid)
    res.render('userProfile',{user:users,courses:[]})
}