const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {
  saveRedirectUrl,
  isLoggedIn,
  isAccountOwner,
} = require("../middleware");
const userController = require("../controllers/user");
const multer = require("multer"); //install multer package in npm || multipart/form-data type receive and paras
// const upload = multer({ dest: 'uploads/' })  //uploads folder me save karega
const { storage } = require("../cloudConfig");
const upload = multer({ storage });
router
  .route("/signup")
  .get(userController.signupForm)
  .post(wrapAsync(userController.postsignupForm));

router
  .route("/login")
  .get(userController.loginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.postloginForm
  );

router.get("/logout", userController.logout);
router
  .route("/change-image/:id")
  .get(isLoggedIn, isAccountOwner, userController.renderImageChangeForm)
  .post(
    isLoggedIn,
    isAccountOwner,
    upload.single("image"),
    wrapAsync(userController.updateImage)
  ); //update image------------
// In your routes file
router.delete(
  "/delete-image/:id",
  isLoggedIn,
  isAccountOwner,
  wrapAsync(userController.deleteImage)
);

module.exports = router;
