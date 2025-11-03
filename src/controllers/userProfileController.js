const user = require("../models/userSchema")


exports.getprofiledashboard = async (req,res)=>{
    const userid = req.params._id
    const users= await user.findById(userid)
    res.render('userProfile',{user:users,courses:[]})
}

exports.getprofileProgress = async (req,res)=>{
    const userid = req.params._id
    const users= await user.findById(userid)
    res.render('userProgress',{user:users,courses:[]})
}