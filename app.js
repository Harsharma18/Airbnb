if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
  console.log("ATLASDB_URL:", process.env.ATLASDB_URL);
}

const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
let port = 3000;
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
// const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";
const DB_URL = process.env.ATLASDB_URL;
const listingroutes = require("./routers/listing");
const reviewroutes = require("./routers/review");
const userroutes = require("./routers/user");
const profileRouter = require("./routers/profile");

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userModel = require("./models/user");

async function main() {
  await mongoose.connect(DB_URL);
}
main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, (req, res) => {
  console.log(`app is listening to port ${3000}`);
});
//Mongo session store
const store = MongoStore.create({
  mongoUrl: DB_URL,

  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.log("Error in mongo session store", err);
});

//Memory storage session store
const sessionOption = {
  store,
  secret: process.env.SECRET,

  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//express session middleware
app.use(session(sessionOption));
app.use(flash());

//passport middleware

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//routes
app.use("/profile", profileRouter);
app.use("/listings", listingroutes);
app.use("/listings/:id/reviews", reviewroutes);
app.use("/", userroutes);

app.get("/", (req, res) => {
  res.redirect("/listings");
});


app.all("*", (req, res, next) => {
  next(new ExpressError("404", "Page Not found"));
});
app.use((err, req, res, next) => {
  let { statuscode = 500, message = "something went wrong" } = err;
  // res.status(statuscode).send(message);
  // res.render("./listings/error.ejs", { err });
  // console.log(message);
  res.status(statuscode).render("./listings/error.ejs", { err });
});
