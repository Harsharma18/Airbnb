const express = require("express");
const router = express.Router({ mergeParams: true })
const wrapAsync = require("../utils/wrapAsync");
const reviewController = require("../controllers/review");
const {
  schemavalidatereview,
  isLoggedIn,
  isreviewAuthor,
} = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  schemavalidatereview,
  wrapAsync(reviewController.postReview)
);
router.delete(
  "/:reviewId",
  isLoggedIn,
  isreviewAuthor,
  wrapAsync(reviewController.deleteReview)
);
module.exports = router;
