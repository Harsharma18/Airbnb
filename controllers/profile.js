const ListingModel = require("../models/listing");
const ReviewModel = require("../models/review");
const userModel = require("../models/user");
// Display user profile with all listings and reviews
module.exports.profile = async (req, res) => {
  try {
    const allListings = await ListingModel.find({
      owner: req.user._id,
    }).populate("owner");

    const allReviews = await ReviewModel.find({
      author: req.user._id,
    }).populate("listingmodelid");
    console.log(allReviews);
    // const allReviews = await ReviewModel.find({
    //   author: req.user._id,
    // }).populate({ path: "listingModelId", strictPopulate: false });

    // console.log(allReviews);
    const listingCount = allListings.length;
    const reviewCount = allReviews.length;

    res.render("profiles/profile", {
      user: req.user,
      allListings,
      allReviews,
      listingCount,
      reviewCount,
    });
  } catch (error) {
    req.flash("error", "Unable to load profile data.");
    res.redirect("/listings");
  }
};

// Delete all listings associated with the user
module.exports.allListingDestroy = async (req, res) => {
  try {
    const { id } = req.params;
    await ListingModel.deleteMany({ owner: id });
    req.flash("success", "All your listings have been deleted.");
    res.redirect("/profile");
  } catch (error) {
    req.flash("error", "Unable to delete your listings.");
    res.redirect("/profile");
  }
};

// Delete a specific listing owned by the user
module.exports.profileDestroyListing = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await ListingModel.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/profile");
    }
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to delete this listing.");
      return res.redirect("/profile");
    }

    let deleteListing = await ListingModel.findByIdAndDelete(id);

    req.flash("success", "Listing deleted successfully.");
    res.redirect("/profile");
  } catch (error) {
    req.flash("error", "Unable to delete the listing.");
    res.redirect("/profile");
  }
};

module.exports.allReviewDestroy = async (req, res, next) => {
  try {
    let { id } = req.params;

    // Find all reviews authored by the user
    let allReviews = await ReviewModel.find({ author: id });

    if (!allReviews.length) {
      req.flash("error", "No reviews found to delete!");
      return res.redirect("/profile");
    }

    // Remove the reviews from associated listings
    for (const review of allReviews) {
      await ListingModel.findByIdAndUpdate(review.listingmodelid, {
        $pull: { reviews: review._id },
      });
    }

    // Delete all reviews
    await ReviewModel.deleteMany({ author: id });

    req.flash(
      "success",
      `All ${allReviews.length} reviews deleted successfully!`
    );
    res.redirect("/profile");
  } catch (error) {
    req.flash("error", "Unable to delete reviews.");
    res.redirect("/profile");
  }
};

module.exports.profileDestroyReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    await ListingModel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await ReviewModel.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect("/profile");
  } catch (error) {
    req.flash("error", "Unable to delete review.");
    res.redirect("/profile");
  }
};
module.exports.deleteAccount = async (req, res) => {
  try {
    let { id } = req.params;

    // Delete all user's listings
    await ListingModel.deleteMany({ owner: id });

    // Delete all user's reviews
    await ReviewModel.deleteMany({ author: id });

    // Delete the user account
    await userModel.findByIdAndDelete(id);

    // Logout the user
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "Your account has been deleted successfully.");
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", "Unable to delete account.");
    res.redirect("/profile");
  }
};

module.exports.renderUpdateProfile = async (req, res) => {
  try {
    let { id } = req.params;
    let user = await userModel.findById(id);
    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/profile");
    }
    res.render("./profiles/update.ejs", { user }); // Rendering update.ejs
  } catch (error) {
    console.error("Error loading update profile page:", error);
    req.flash("error", "Unable to load update page.");
    res.redirect("/profile");
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    let { id } = req.params;
    let { username, email, oldPassword, newPassword } = req.body;

    let user = await userModel.findById(id);
    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/profile");
    }

    // Update username and email
    user.username = username || user.username;
    user.email = email || user.email;

    // If user wants to update password
    if (newPassword) {
      if (!oldPassword) {
        req.flash("error", "Please enter your current password to update.");
        // return res.render("profiles/update", { user });
        return res.redirect(`/profile/update/${id}`);
      }

      // Verify old password
      user.authenticate(oldPassword, (err, authenticatedUser) => {
        if (err || !authenticatedUser) {
          req.flash("error", "Incorrect current password!");
          return res.redirect("/profile");
        }

        // Set new password
        user.setPassword(newPassword, async (err) => {
          if (err) {
            req.flash("error", "Error updating password.");
            return res.redirect("/profile");
          }
          await user.save();
          req.flash("success", "Profile updated successfully!");
          return res.redirect("/listings");
        });
      });
    } else {
      await user.save();
      req.flash("success", "Profile updated successfully!");
      res.redirect("/profile");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    req.flash("error", "Unable to update profile.");
    res.redirect("/profile");
  }
};
// module.exports.updateProfile = async (req, res) => {
//   try {
//     let { id } = req.params;
//     let { username, email, password } = req.body;

//     let user = await userModel.findById(id);
//     if (!user) {
//       req.flash("error", "User not found!");
//       return res.redirect("/profile");
//     }

//     // Update username and email
//     user.username = username || user.username;
//     user.email = email || user.email;

//     // Update password if provided
//     if (password) {
//       user.setPassword(password, async (err) => {
//         if (err) {
//           req.flash("error", "Error updating password.");
//           return res.redirect("/profile");
//         }
//         await user.save();
//       });
//     } else {
//       await user.save();
//     }

//     req.flash("success", "Profile updated successfully!");
//     res.redirect("/profile");
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     req.flash("error", "Unable to update profile.");
//     res.redirect("/profile");
//   }
// };
