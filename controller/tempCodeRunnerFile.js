const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const cloudinary = require('cloudinary').v2;

//for access env token
require('dotenv').config();

//access map service geocoding
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});
//index route
module.exports.index= async(req,res)=>{
    const allListing  = await Listing.find();
    res.render("./listings/index.ejs",{allListing});
};
//new Route
module.exports.renderNewForm= (req,res)=>{
    res.render("./listings/new.ejs");
  };
  //create listing route
  module.exports.createListing = async(req,res,next)=>{
    const { title, description, image, price, location, country } = req.body;
   let response = await geocodingClient.forwardGeocode({
        query: `${location},${country}`,
        limit: 1,
      }).send();
    let filename = req.file.filename;
    let url = req.file.path;
    console.log(url ,"..".filename);
    // const { title, description, image, price, location, country } = req.body; // Extracting variables from req.body
    
 const  newListings = new Listing(
    {title,description,image,price,location,country}
    );
    newListings.owner = req.user.id;
    newListings.image = {filename,url};
    newListings.geometry = response.body.features[0].geometry;
    let savedListing = await  newListings.save();
    console.log(savedListing);
    req.flash("success","New Listing Created");
    res.redirect("/listings");

};
//show listing route
module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listingsh = await Listing.findById(id)
    .populate({path:"reviews",populate:{
        path:"author", 
    },
}).populate("owner");
    if(!listingsh){
        req.flash("error","Listing Does Not Exist");
        res.redirect("/listings");

    }
    console.log(listingsh);
    res.render("./listings/show.ejs",{listingsh});
};
//edit route
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listinged = await Listing.findById(id);
    
    if (!listinged) {
        req.flash("error", "Listing Does Not Exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = ''; // Define it outside the if block

    if (listinged.image && listinged.image.url) {
        console.log("Image Object:", listinged.image);
        console.log(listinged.image.url);
        originalImageUrl = listinged.image.url.replace("/upload", "/upload/h_150,w_100");
        console.log("Original Image URL:", originalImageUrl);
    } else {
        console.log("Image URL not found in listinged.image");
    }

    res.render("./listings/edit.ejs", { listinged, originalImageUrl });

};

//update route
module.exports.updateListing = async (req, res) => {

    const { id } = req.params;
    const { title, description, image, price, location, country } = req.body;

    console.log("Updating listing with ID:", id);

     const updateListing = await Listing.findByIdAndUpdate(id, {
        title,
        description,
        image,
        price,
        location,
        country,
    }); 

    console.log("Listing updated successfully");
    console.log(updateListing);
    if(typeof req.file !=="undefined"){
        let filename = req.file.filename;
        let url = req.file.path;
        updateListing.image = {url,filename};
    }
    await updateListing.save();
    
    req.flash("success","You update the listing");

    //res.redirect("/listings");
    res.redirect(`/listings/${id}`);
};
//delete route
module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success","You Delete the listing");
    res.redirect("/listings");
};

//create new route 
// app.post("/listings",async(req,res)=>{
//     let {title,description,image,price,location,country} = req.body;
//        const  newListings = new Listing(
//         {title,description,image,price,location,country}
//         );
//        await  newListings.save();
//         res.redirect("/listings");
    //or we can write this also lists writre when we write new.ejs name in lists[title this format ]
    // if (!req.body.listings){
    //     throw new ExpressError(400,"Please send valid data");
    // }
//     const newListings = new Listing(req.body.lists);
   
//     newListings.save();
//     res.redirect("/listings");
// });
//create route using custom error handling 
// app.post("/listings",async(req,res,next)=>{
//     try{
//         let {title,description,image,price,location,country} = req.body;
        // const  newListings = new Listing(
        //  {title,description,image,price,location,country}
        //  );
        // await  newListings.save();
        //  res.redirect("/listings");
        
        
//     }catch(err){
//     next(err);
//     }
// });
//using wrapAsunc create route 
// app.post("/listings" ,wrapAsync(async(req,res,next)=>{
//     const { title, description, image, price, location, country } = req.body; // Extracting variables from req.body
//     if (!title || !description ||  !price || !location || !country) { // Checking if any of the required fields are missing
//         throw new ExpressError(400, "Please send valid data");
//     }
    
    // const  newListings = new Listing(
    //     {title,description,image,price,location,country}
    //     );
//         if(!newListings.title){
//             throw new ExpressError(404,"title is missing");
//         }
//         if(!newListings.description){
//             throw new ExpressError(404,"description is missing");
//         }
//         if(!newListings.price){
//             throw new ExpressError(404,"price  is missing");
//         }
    //    await  newListings.save();
    //     res.redirect("/listings");
// })

// );

//most efficient usin joi npm package
// app.post("/listings",wrapAsync(async(req,res,next)=>{
        // const { title, description, image, price, location, country } = req.body; // Extracting variables from req.body
//     let result = listingSchema.validate(req.body);
//     console.log(result);
//     if(result.error){
//         throw new ExpressError(404,result.error);
//     }
    // const  newListings = new Listing(
    //     {title,description,image,price,location,country}
    //     );
    //     await  newListings.save();
    //     res.redirect("/listings");
// })
// );
//update route 
// app.put("/listings/:id",async(req,res)=>{
//     //or
//     let {id} = req.params;
//    const updateListing =  await Listing.findByIdAndUpdate(id,{...req.body.lists});
//    //or
// //   await Listing.findByIdAndUpdate(id,{...req.body.lists});

//     res.redirect(`/listings/${id}`);
//     console.log(updateListing);
//    // res.redirect("/listings");
   
// });
