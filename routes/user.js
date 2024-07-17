const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
//utils wrapasync path access
const wrapAsync= require("../utils/wrapAsync.js");
//access passport
const passport = require("passport");
//access saveRedirectUrl
const  {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controller/user.js");
router.route("/signup")
.get((userController.renderSignupForm))
.post(wrapAsync(userController.signUp))

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",
{failureRedirect:"/login",
failureFlash:true}),
wrapAsync(userController.login));

//logout 
router.get("/logout",userController.logout);

module.exports = router;