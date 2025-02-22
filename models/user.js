const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      default: "/icons/userpreview.png", // Default image URL
    },
    filename: {
      type: String,
      default: "user-image", // Default filename
    },
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("UserModel", userSchema);
