if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongourl = "mongodb://127.0.0.1:27017/Wandurlust";
// const atlasurl = process.env.ATLASDB_URL;

// Access utils express error path
const ExpressError = require("./utils/ExpressError.js");
// Views path require
const path = require("path");
// For access review
app.set("views", path.join(__dirname, "views"));
// For accessing ejs template
app.set("view engine", "ejs");
// For access all data parse in request
app.use(express.urlencoded({ extended: true }));
// Access method override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
// ejs-mate helps to create multiple templates
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
// For authentication
const passport = require("passport");
const localPassport = require("passport-local");
const User = require("./models/user.js")

// Access express session
const session = require("express-session");
// const mongoStore = require("connect-mongo");
// const store = mongoStore.create({
//     mongoUrl: atlasurl,
//     crypto: {
//         secret: process.env.SECRET,
//     },
//     touchAfter: 900,
// });
// store.on("error", (err) => {
//     console.log("error in mongostore", err);
// });
const sessionOption = {
    // store: store,  // Uncomment this if using MongoDB to store sessions
    secret: process.env.SECRET || 'secret',  // Use a fallback secret if .env is not available
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};
app.use(session(sessionOption)); 

// Access flash
const flash = require("connect-flash");
app.use(flash());
// Authenticate is used for login and signup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Access route listing.js
const listingRouter = require("./routes/listing.js");
app.use("/listings", listingRouter);
// Access route review.js
const reviewRouter = require("./routes/review.js");
app.use("/listings/:id/reviews", reviewRouter);
// Access user routes
const userRouter = require("./routes/user.js");
app.use("/", userRouter);

// For access style css
app.use(express.static(path.join(__dirname, "/public")));

// MongoDB connection
async function main() {
    await mongoose.connect(mongourl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

main().then(() => {
    console.log("connected to database");
}).catch((err) => { console.log(err); });

// Middleware
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statuscode = 500, message = "Something went wrong" } = err;
    res.status(statuscode).render("error.ejs", { message });
});

// For testing
// app.get("/", (req, res) => { res.send("Hi, I am root") });
// app.get("/sampletest", async (req, res) => {
//     let sampletesting = new Listing({
//         title: "My new villa",
//         description: "By the Beach",
//         price: 1200,
//         location: "goa",
//         Country: "India",
//     });
//     // For saving
//     await sampletesting.save().then((res) => { console.log(res) });
//     console.log("testing successful");
//     res.send("Testing is successful");
// });

app.listen(8080, () => { console.log("app is connected to server") });
