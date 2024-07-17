if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}
const express = require("express");  
const app = express();
const mongoose = require("mongoose");
// const mongourl = "mongodb://127.0.0.1:27017/Wandurlust";
const atlasurl = process.env.ATLASDB_URL;
//acces utils express error path
const ExpressError = require("./utils/ExpressError.js");
//views path require 
const path = require("path");
//for access review 
app.set("views",path.join(__dirname,"views"));
//for accessing ejs template 
app.set("view engine","ejs");
//for access all data parse in  request 
app.use(express.urlencoded({extended:true}));
//access method override 
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
//ejs mate help to create multiple template 
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);
//for autentication 
const passport = require("passport");
const localPassport = require("passport-local");
const User = require("./models/user.js")

//access express session 
const session = require("express-session");
const mongoStore = require("connect-mongo");
const store = mongoStore.create({
    mongoUrl : atlasurl,
   crypto : {
    secret:process.env.SECRET,
   },
   touchAfter : 900,
});
store.on("error",(err)=>{
    console.log("error in mongostore",err);
});
const sessionOption ={
    store : store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie :{
        expires:Date.now()+7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true,
    }
} 
app.use(session(sessionOption));  
//access flash 
const flash = require("connect-flash");
app.use(flash());
//authenticate is used for login and signup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log("Middleware executed");
    console.log("User:", req.user);
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; 
    next();
});



//access route listing.js
const listingRouter = require("./routes/listing.js");
app.use("/listings", listingRouter);
//access route review.js
const reviewRouter = require("./routes/review.js");
app.use("/listings/:id/reviews", reviewRouter);
//access user routes
const userRouter = require("./routes/user.js");
app.use("/", userRouter);

//for access style css 
app.use(express.static(path.join(__dirname,"/public")));
async function main(){
    await mongoose.connect(atlasurl);
}

main().then(()=>{
    console.log("connected to database");
}).catch((err)=>{console.log(err)});
// pdkdf2 hashing is used 
// app.get("/demouser" ,async(req,res)=>{
//     let fakeUser= new User({
//         email: "Har@gmail.com",
//         username :"Navet",
//     })
//   let registeredUser = await  User.register(fakeUser,"Hars");
//   console.log(registeredUser);
//   res.send(registeredUser);
// })



//middleware

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});
app.use((err,req,res,next)=>{
    let {statuscode=500,message="Something went wrong"}=err;
   // res.status(statuscode).send(message);
   res.status(statuscode).render("error.ejs",{message});

});

//for testing
// app.get("/",(req,res)=>{res.send("Hi, I am root")});
// app.get("/sampletest",async(req,res)=>{
//     let sampletesting = new Listing({
//         title:"My new villa ",
//         description:"By the Beach",
//         price:1200,
//         location : "goa",
//         Country:"India",
//     });
//     //for saving 
//     await sampletesting.save().then((res)=>{console.log(res)});
//     console.log("testing successful");
//     res.send("Testing is succesful");
// });

app.listen("8080",()=>{console.log("app is connected to server")}); 
