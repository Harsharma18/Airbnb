const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: String,
  listingmodelid: {
    type: Schema.Types.ObjectId,
    ref: "ListingModel",
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("ReviewModel", reviewSchema);
