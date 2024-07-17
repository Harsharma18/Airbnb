const express = require ("express");
const router=express.Router();
const Listing = require("../models/listing.js");
const  {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
//to access multipart/form data 
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

//utils wrapasync path access 
const wrapAsync= require("../utils/wrapAsync.js")
const listingController = require("../controller/listing.js");
router.route("/")
.get((listingController.index))
.post(isLoggedIn,
     upload.single("image"), 
     validateListing, 
     wrapAsync(listingController.createListing));
// .post(upload.single("image"),(req,res)=>{
//     res.send(req.file);
//     console.log(req.file);
// });

//new route 
router.get("/new",isLoggedIn,listingController.renderNewForm);
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,
    upload.single("image"),
    validateListing, 
    wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))
//Edit Route 
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;
