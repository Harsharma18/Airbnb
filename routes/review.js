const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateReview } = require("../middleware.js");
const { isAuthor } = require("../middleware.js");
const reviewController = require("../controller/review.js");

// Review post route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete review route
router.delete("/:reviewId", isLoggedIn, isAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;

