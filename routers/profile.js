const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const profileController = require("../controllers/profile.js");
const multer = require("multer"); //install multer package in npm || multipart/form-data type receive and paras
// const upload = multer({ dest: 'uploads/' })  //uploads folder me save karega
const { storage } = require("../cloudConfig");
const upload = multer({ storage });
const {
  isLoggedIn,
  isOwner,
  isreviewAuthor,
  isReviewAll,
  isOwnerAll,
  isAccountOwner,  
} = require("../middleware");

router.get("/", isLoggedIn, wrapAsync(profileController.profile));
router.delete(
  "/delete/:id",
  isLoggedIn,
  isAccountOwner,
  wrapAsync(profileController.deleteAccount)
);

router.delete(
  "/all-listings-delete/:id",
  isLoggedIn,
  isOwnerAll,
  wrapAsync(profileController.allListingDestroy)
);
router.delete(
  "/listings/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(profileController.profileDestroyListing)
);
router.delete(
  "/all-reviews-delete/:id",
  isLoggedIn,
  isReviewAll,
  wrapAsync(profileController.allReviewDestroy)
); //PROFILE Delete All Listings Route-------------
router.delete(
  "/review/:id/:reviewId",
  isLoggedIn,
  isreviewAuthor,
  wrapAsync(profileController.profileDestroyReview)
); //PROFILE Delete One Listing Route-------------
router.get(
  "/update/:id",
  isLoggedIn,
  isAccountOwner,
  wrapAsync(profileController.renderUpdateProfile)
);

router.put(
  "/update/:id",
  isLoggedIn,
  isAccountOwner,
  wrapAsync(profileController.updateProfile)
);
module.exports = router;
