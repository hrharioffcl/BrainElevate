const jwt = require("jsonwebtoken");
const generateadmintoken =(adminId,adminrole)=>{
    return jwt.sign({id:adminId,role:adminrole},process.env.JWT_SECRET)
};

module.exports = generateadmintoken;