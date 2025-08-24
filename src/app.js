require("dotenv").config()

const express = require ("express")
const app = express()
app.use(express.json())
app.use(express.static('public'));

const connectDB = require("./config/db")

connectDB().then(()=>{
    const PORT = process.env.PORT||8100;

app.listen(PORT,()=>{

    console.log("server started")
})
})


app.get('/',(req,res)=>{
res.send("started the application")
})


 
