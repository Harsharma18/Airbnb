if (process.env.NODE_ENV != "production") {
	require("dotenv").config();
}
const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const atlasurl = process.env.ATLASDB_URL;
async function main(){
   //await mongoose.connect("mongodb://127.0.0.1:27017/Wandurlust");
   await mongoose.connect(atlasurl);
}
main().then(()=>{console.log("database was connected")}).catch((err)=>{
    console.log(err);
});
const initDb = async()=>{ 
    await Listing.deleteMany({});
    //map dont create copy co we initialise initdata
    initdata.data = initdata.data.map((obj)=>({...obj,owner:"65d2cd781401f46af7f42c6f"}))
    await Listing.insertMany(initdata.data);
    console.log("data was initialised");
}
initDb();
