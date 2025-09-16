const jwt = require("jsonwebtoken");
const generateusertoken =(userId)=>{
    return jwt.sign({id: userId, role: "user"},process.env.JWT_SECRET)
};

module.exports = generateusertoken;