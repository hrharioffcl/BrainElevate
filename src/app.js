require("dotenv").config()

const express = require("express")
const app = express()
const path = require("path");
const cookieParser = require("cookie-parser")
app.use(cookieParser());

const session = require("express-session")
app.use(session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 } // 10 minutes
}));

const passport = require("passport");
require("./config/passport"); // passport config

app.use(passport.initialize());
app.use(passport.session());


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "views"));
app.use(express.static (path.join(__dirname, "public")));

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
const googleauthRoutes = require("./routes/googleauth");
app.use("/", googleauthRoutes);


app.get('/', (req, res) => {
    res.send("started the application")
})



