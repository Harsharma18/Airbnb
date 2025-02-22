const ListingModel = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index = async (req, res) => {
  const allListings = await ListingModel.find({});
  res.render("./listings/index.ejs", { allListings });
};
module.exports.createListing = (req, res) => {
  res.render("./listings/new.ejs");
};
module.exports.postListing = async (req, res) => {
  // if (!req.body.listing) {
  //   throw new ExpressError(404, "send valid data");
  // }
  let url = req.file.path;
  let filename = req.file.filename;

  console.log(req.file);
  let locToCoord = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  // console.log(locToCoord.body.features[0].geometry);
  let newListing = new ListingModel(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  console.log("Image uploaded:", newListing.image);
  newListing.geodata = locToCoord.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};
module.exports.showlisting = async (req, res) => {
  const { id } = req.params;

  let showlisting = await ListingModel.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  console.log(showlisting);

  if (!showlisting) {
    req.flash("error", "Listing you requested not exist");
    res.redirect("/listings");
  }

  res.render("./listings/show.ejs", { showlisting });
};
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  let editListing = await ListingModel.findById(id);
  // console.log(editListing);
  if (!editListing) {
    req.flash("error", "Listing you requested not exist");
    res.redirect("/listings");
  }
  let originalImageUrl = editListing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_200");
  res.render("./listings/edit.ejs", { editListing, originalImageUrl });
};
//update route
//let { listing } = req.body;
// //   let updateListing = await ListingModel.findByIdAndUpdate(id, listing, {
// //     new: true,
// //   });
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const { listing } = req.body;

  // Geocode the new location
  let locToCoord = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location, // The new location entered by the user
      limit: 1,
    })
    .send();

  // Find the listing and update it with the new data
  let updateListing = await ListingModel.findByIdAndUpdate(id, listing, {
    new: true,
  });

  // Update geodata with the new coordinates
  updateListing.geodata = locToCoord.body.features[0].geometry;

  // If a new image is uploaded, update the image
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updateListing.image = { url, filename };
  }

  // Save the updated listing
  await updateListing.save();

  req.flash("success", "Listing is updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  let deleteListing = await ListingModel.findByIdAndDelete(id);
  // console.log(deleteListing);
  req.flash("error", "Listing is deleted");
  res.redirect("/listings");
};
module.exports.filter = async (req, res) => {
  const { category } = req.params;

  let filteredListings = await ListingModel.find({
    category: { $all: [category] },
  });
  console.log(filteredListings);
  if (filteredListings.length != 0) {
    res.locals.success = `Listings Find by ${category}`;
    res.render("./listings/index.ejs", { allListings: filteredListings });
  } else {
    req.flash("error", "Listings is not here !!!");
    res.redirect("/listings");
  }
};
module.exports.removeCategory = async (req, res) => {
  const { id, category } = req.params;

  try {
    const updatedListing = await ListingModel.findByIdAndUpdate(
      id,
      { $pull: { category: category } },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    req.flash("success", `${category} named category removed successfully`);
    res.redirect(`/listings/${id}/edit`);
  } catch (error) {
    req.flash("error", "An error occurred while removing the category");
    res.redirect(`/listings/${id}/edit`);
  }
};
module.exports.removeAllCategories = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedListing = await ListingModel.findByIdAndUpdate(
      id,
      { $set: { category: [] } }, // Remove all categories
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    req.flash("success", "All categories removed successfully");
    res.redirect(`/listings/${id}/edit`);
  } catch (error) {
    console.error(error);
    req.flash("error", "An error occurred while removing all categories");
    res.redirect(`/listings/${id}/edit`);
  }
};

module.exports.search = async (req, res) => {
  const { query } = req.query;
  console.log("Search Query:", query);

  if (!query || query.trim() === "") {
    req.flash("error", "Please enter a search term");
    return res.redirect("/listings");
  }

  const searchQuery = query.trim();
  const priceQuery = parseFloat(searchQuery);
  let searchedListings = [];

  //   if query is a price (number-based search)
  if (!isNaN(priceQuery)) {
    searchedListings = await ListingModel.find({ price: { $lte: priceQuery } });
    if (searchedListings.length > 0) {
      res.locals.success = `Listings found with price less than or equal to ${priceQuery}`;
      return res.render("./listings/index.ejs", {
        allListings: searchedListings,
      });
    }
  }

  // Exact Category Match (Avoid Partial Text Match Issues)
  searchedListings = await ListingModel.find({ category: searchQuery });

  if (searchedListings.length > 0) {
    res.locals.success = `Listings found in the category: ${searchQuery}`;
    return res.render("./listings/index.ejs", {
      allListings: searchedListings,
    });
  }

  //  If no exact category match, use full-text search
  searchedListings = await ListingModel.find({
    $text: { $search: searchQuery },
  });

  if (searchedListings.length > 0) {
    res.locals.success = `Listings found for "${searchQuery}"`;
    return res.render("./listings/index.ejs", {
      allListings: searchedListings,
    });
  }

  // No results found
  req.flash("error", `No listings found for "${searchQuery}"`);
  res.redirect("/listings");
};

// module.exports.search = async (req, res) => {
//   const { query } = req.query;
//   console.log("Search Query:", query);

//   if (!query || query.trim() === "") {
//     req.flash("error", "Please enter a search term");
//     return res.redirect("/listings");
//   }

//   const searchQuery = query.trim(); // Remove spaces
//   let searchedListings = await ListingModel.find({
//      $or: [
//   { title: { $regex: searchQuery, $options: "i" } },
//   { description: { $regex: searchQuery, $options: "i" } },
//   { location: { $regex: searchQuery, $options: "i" } },
//   { country: { $regex: searchQuery, $options: "i" } },
//   { category: searchQuery }, // Exact match for category array
// ],
//
//   });

//   console.log("Search Results:", searchedListings);

//   if (searchedListings.length === 0) {
//     req.flash("error", `No listings found for "${searchQuery}"`);
//     return res.redirect("/listings");
//   }

//   res.render("./listings/index.ejs", { allListings: searchedListings });
// };
// module.exports.search = async (req, res) => {
//   const { query } = req.query;
//   console.log("Search Query:", query);

//   if (!query || query.trim() === "") {
//     req.flash("error", "Please enter a search term");
//     return res.redirect("/listings");
//   }

//   const searchQuery = query.trim();
//   const priceQuery = parseFloat(searchQuery);
//   let searchedListings;

//   if (!isNaN(priceQuery)) {
//     // Search for listings with a price less than or equal to the entered number
//     searchedListings = await ListingModel.find({
//       price: { $lte: priceQuery },
//     });
//     if (searchedListings.length > 0) {
//       res.locals.success = `Listings found with price less than or equal to ${priceQuery}`;
//       return res.render("./listings/index.ejs", { allListings: searchedListings });
//     }
//   } else {
//     // Perform a regex search across multiple fields
//     const regex = new RegExp(searchQuery, "i"); // 'i' for case-insensitive
//     searchedListings = await ListingModel.find({
//       $or: [
//         { title: { $regex: regex } },
//         { description: { $regex: regex } },
//         { location: { $regex: regex } },
//         { country: { $regex: regex } },
//         { category: { $regex: regex } },
//       ],
//     });
//     if (searchedListings.length > 0) {
//       res.locals.success = `Listings found for "${searchQuery}"`;
//       return res.render("./listings/index.ejs", { allListings: searchedListings });
//     }
//   }

//   // If no listings are found
//   req.flash("error", `No listings found for "${searchQuery}"`);
//   res.redirect("/listings");
// };
