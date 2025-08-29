const mongoose = require("mongoose");
const {ensureSuperAdmin} = require("../utils/ensuresuperadmin")
const connectDB = async ()=>{
try {
await mongoose.connect(process.env.MONGO_URI)
ensureSuperAdmin()
    console.log("MONGOOSE CONNECCTED")
} catch (error) {
    console.error("mongoode connection failed",error)
}
    
}

module.exports =connectDB;