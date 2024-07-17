const Listing = require("./models/listing");
const Review = require("./models/review.js");
//acces utils express error path
const ExpressError = require("./utils/ExpressError.js");
//access path of joi schemajoi.js and review schema 
const {listingSchema,reviewSchema} = require("./schemajoi.js");

module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req);
    // console.log(req.user);
    // console.log(req.path);
    // console.log(req.path + ".." + req.originalUrl);
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create Listing 🥲");
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
module.exports.isOwner = async(req,res,next)=>{
  let {id} = req.params;
  let listingsh = await Listing.findById(id);
  if(!listingsh.owner.equals(res.locals.currUser._id)){
    req.flash("error","Youy are not owner of this Listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
}
//validation for joi schema in form of middleware we wrap in function 
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate({listing:req.body});
    if(error){
       
        throw new ExpressError(400,error);
    }else{
        next();
    }
}
//validation for review joi schema in form of middleware
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate({review:req.body});
    if(error){
        throw new ExpressError(404,error);
    }else{
        next();
    }
}
module.exports.isAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error","You are not author of this Review");
      return res.redirect(`/listings/${id}`);
    }
    next();
  }
