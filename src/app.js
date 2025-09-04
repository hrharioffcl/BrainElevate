require("dotenv").config()
const ngrok = require("ngrok");

const express = require("express")
const app = express()
const path = require("path");
const cookieParser = require("cookie-parser")
app.use(cookieParser());
const nocache = require("nocache");

app.use(nocache());
const session = require("express-session")
app.use(session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 } // 10 minutes
}));
const flash = require("connect-flash");
app.use(flash());


// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

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

    app.listen(PORT,async  () => {
console.log(`✅ Server started on http://localhost:${PORT}`);
  
    })
})

//import routes
const userroutes= require("./routes/userauth")
const adminroutes = require("./routes/adminauth")
const googleauthRoutes = require("./routes/googleauth");

//usee routes

app.use("/", userroutes)
app.use("/", googleauthRoutes);
app.use('/admin',adminroutes)





