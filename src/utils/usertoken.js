const jwt = require("jsonwebtoken");
const generateusertoken =(userId)=>{
    return jwt.sign({id: userId},process.env.JWT_SECRET)
};

module.exports = generateusertoken;