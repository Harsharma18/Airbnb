if (process.env.NODE_ENV != "production") {
  require("dotenv").config({ path: "../.env" }); 
  console.log("ATLASDB_URL:", process.env.ATLASDB_URL); //
}
const mongoose = require("mongoose");
const initData = require("./data");
const ListingModel = require("../models/listing");

// const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";
const DB_URL = process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(DB_URL);
}
main()
  .then(() => {
    console.log(" connected is estalished in index.js ");
  })
  .catch((err) => {
    console.log(err);
  });
  let categoryAll = [
    "Beachfront",
    "Cabins",
    "Omg",
    "Lake",
    "Design",
    "Amazing Pools",
    "Farms",
    "Amazing Views",
    "Rooms",
    "Lakefront",
    "Tiny Homes",
    "Countryside",
    "Treehouse",
    "Trending",
    "Tropical",
    "National Parks",
    "Casties",
    "Camping",
    "Top Of The World",
    "Luxe",
    "Iconic Cities",
    "Earth Homes",
  ];
const initDb = async () => {
  await ListingModel.deleteMany({});
  const initDatas = initData.map((obj) => ({
    ...obj,
    owner: "67b870da53e56baac73a36e7",
    price: obj.price * 25,
		category: [
			`${categoryAll[Math.floor(Math.random() * 22)]}`,
			`${categoryAll[Math.floor(Math.random() * 22)]}`,
		],
    // image: {
    //   ...obj.image,
    //   filename: obj.image.filename || "listingimage", // Add filename if missing
    // },
  }));
  await ListingModel.insertMany(initDatas).then(() => {
    // console.log(initData);
    console.log("data was initialised");
  });
};
initDb();
