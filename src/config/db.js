const mongoose = require("mongoose");

const connectDB = async ()=>{
try {
await mongoose.connect(process.env.MONGO_URI)
    console.log("MONGOOSE CONNECCTED")
} catch (error) {
    console.error("mongoode connection failed",error)
}
    
}

module.exports =connectDB;