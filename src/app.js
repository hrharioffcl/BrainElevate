require("dotenv").config()

const express = require("express")
const app = express()
const path = require("path");

const session = require("express-session")
app.use(session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 } // 10 minutes
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "views"));

const connectDB = require("./config/db")

connectDB().then(() => {
    const PORT = process.env.PORT || 8100;

    app.listen(PORT, () => {

        console.log("server started")
    })
})

//import routes
const authRoutes = require("./routes/userauth")
//usee routes
app.use("/", authRoutes)

app.get('/', (req, res) => {
    res.send("started the application")
})



