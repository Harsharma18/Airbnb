 const mongoose = require("mongoose");
const Review = require("./review.js");

// // Creating Schema
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {  
        filename:String,
       url:String,
       
    },
   
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,  //it will store MongoDB ObjectIds. ObjectIds are unique identifiers automatically generated by MongoDB for each document.
        ref:"User",

    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
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
//mongoose middleware when we delete any review and delete listing but after deleting listing reviewobject id show to delete both listing and revie we se mongoose middleware
listingSchema.post("findOneAndDelete",async(reviewdata)=>{
if(reviewdata){
    await Review.deleteMany({id:{$in:reviewdata.reviews}})
}
})
// // Creating model
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;