const Listing = require("../models/listing");
const Review = require("../models/review.js");
//create route
 module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Find the listing by ID
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Create a new review
    const newReview = new Review({ rating, comment });
    newReview.author = req.user._id;

    // Push the new review to the listing's reviews array
    listing.reviews.push(newReview);

    // Save the new review and the updated listing
    await newReview.save();
    await listing.save();

    req.flash("success", "You reviewed the listing successfully");
    res.redirect(`/listings/${id}`);
};
//delete route
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review ID from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "You deleted the review successfully");
    res.redirect(`/listings/${id}`);
}
//or //review post route wrapasyn for error handling 
// router.post("/",async(req,res)=>{
// let listingr = await Listing.findById(req.params.id);
// let newReview = new Review(req.body.review);
// listingr.reviews.push(newReview);  
// await newReview.save();
// await listingr.save();
// console.log(newReview);
// res.redirect(`/listings/${listingr.id}`)
// });