const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, schemaValidateListing } = require("../middleware");
const listingController = require("../controllers/listing");

//index route
router.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,

  upload.single("listing[image]"),
  schemaValidateListing,
  wrapAsync(listingController.postListing)
);
//create route
router.get("/new", isLoggedIn, listingController.createListing);
router.get("/search", wrapAsync(listingController.search));

router.get("/filter/:category", wrapAsync(listingController.filter));
router.get("/:id/remove-category/:category", isLoggedIn, isOwner, wrapAsync(listingController.removeCategory));
// Add a new route for removing all categories
router.get("/:id/remove-all-categories", isLoggedIn, isOwner, wrapAsync(listingController.removeAllCategories));

/// show route,update ,delete route
router
  .route("/:id")
  .get(wrapAsync(listingController.showlisting))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    schemaValidateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isOwner, wrapAsync(listingController.deleteListing));
 
//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);


module.exports = router;
// app.get("/test",async(req,res)=>{
//     let sampleListing = new ListingModel({
//         title:"My New Vila",
//         description:"By The beach",
//         price:1200,
//         location:"Goa",
//         country : "India",
//     })
//     await sampleListing.save().then(()=>{
//         res.send("sample Listing sucess");
//     });
// })
//post route
// const { title, description, image, price, country, location } = req.body;
// let newListing = new ListingModel({
//   title,
//   description,
//   image,
//   price,
//   country,
//   location,
// });
//let {listing} = req.body;
//  let newListing = new ListingModel(listing);
