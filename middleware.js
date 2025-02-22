const ListingModel = require("./models/listing");
const userModel = require("./models/user");
const ReviewModel = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const {
  reviewjoischema,
  listingjoischema,
  userjoischema,
} = require("./schema");
module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.path, "....", req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged");
    return res.redirect("/login");
  }
  next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let checklisting = await ListingModel.findById(id);
  if (!checklisting.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
//middleware for schemavalidation

module.exports.schemaValidateListing = (req, res, next) => {
  let { error } = listingjoischema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
//review middleware
module.exports.schemavalidatereview = (req, res, next) => {
  let { error } = reviewjoischema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((review) => review.message).join(",");
    console.log(error);
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
//review owner middleware
module.exports.isreviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let checklisting = await ReviewModel.findById(reviewId);
  if (!checklisting.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not author of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
module.exports.isReviewAll = async (req, res, next) => {
  try {
    let { id } = req.params;
    let review = await ReviewModel.findOne({ author: id });
    if (!review) {
      req.flash("error", "You don't have any reviews...");
      return res.redirect(`/profile`);
    }
    if (!review.author.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the author of this review...");
      return res.redirect(`/listings`);
    }
    next();
  } catch {
    next(new ExpressError(400, "This Review Page is not valid..."));
  }
};
module.exports.isOwnerAll = async (req, res, next) => {
  try {
    let { id } = req.params;
    console.log(id);
    let listing = await ListingModel.findOne({ owner: id });
    console.log(listing);
    if (!listing) {
      req.flash("error", "You don't have any listings...");
      return res.redirect(`/profile`);
    }
    if (!listing.owner.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the owner of this listing...");
      return res.redirect(`/listings`);
    }
    next();
  } catch (err) {
    next(new ExpressError(400, "This Listing Page is not valid..."));
  }
};
module.exports.isAccountOwner = async (req, res, next) => {
  let { id } = req.params;
  if (!req.user._id.equals(id)) {
    req.flash("error", "You are not profile owner");
    return res.redirect("/profile");
  }
  next();
};
