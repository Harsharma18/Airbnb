const ListingModel = require("../models/listing");
const ReviewModel = require("../models/review");
// const { rating, comment } = req.body; if we write in form name=rating instead of name=review[rating]
// let newReview = new ReviewModel({ rating, comment });

module.exports.postReview = async (req, res) => {
  const { id } = req.params;
  const { review } = req.body;
  let listing = await ListingModel.findById(id);
  let newReview = new ReviewModel({  rating: review.rating,
    comment: review.comment,
    author: req.user._id,  
    listingmodelid: listing._id    
    });

  newReview.author = req.user._id;
   newReview.listingmodelid = listing._id;
  console.log("Received Review Data: ", review);
  console.log("New Review Object Before Save: ", newReview);
  await newReview.save();
  listing.reviews.push(newReview._id);

  await listing.save();

        console.log("Review saved successfully: ", newReview);
        console.log("Updated Listing with Reviews: ", listing);
        req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  let listing = await ListingModel.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  let deletereview = await ReviewModel.findByIdAndDelete(reviewId);
  req.flash("error", "Review deleted successfully!");
  res.redirect(`/listings/${listing._id}`);
};
