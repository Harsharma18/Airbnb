const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ReviewModel = require("./review");
const userModel = require("./user");
const listingSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
  },
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "ReviewModel",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
  },
  geodata: {
    type: {
      type: String, // Don't do `{ geodata: { type: String } }`
      enum: ["Point"], // 'geodata.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
    type: [String],
  },
});

//write if we use $text for search functionality
listingSchema.index({
  title: "text",
  description: "text",

  location: "text",
  country: "text",
});

//handling delete error when we del listing review also del
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews.length > 0) {
    await ReviewModel.deleteMany({ _id: { $in: listing.reviews } });
    // console.log("Associated reviews deleted");
  }
});

const ListingModel = mongoose.model("ListingModel", listingSchema);
module.exports = ListingModel;
