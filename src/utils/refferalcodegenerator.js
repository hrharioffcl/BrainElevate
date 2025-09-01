const {nanoid}= require('nanoid');
const User = require("../models/userSchema")

async function createrefferalcode() {
const code = await nanoid(8).toUpperCase()
console.log(code)
const codeexist = await User.findOne({refferalcode:code})
if(codeexist){
    return createrefferalcode()
}
return code;
}

module.exports={createrefferalcode}