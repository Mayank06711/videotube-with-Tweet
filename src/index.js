// require('dotenv').config({ path: ".env" });
import dotenv from "dotenv";

import connectDB from "./db/index.js";
import {app} from "./app.js"

dotenv.config({
  path: ".env",
}); // we have add this in package json file under dev -r dotenv/config --experimental-json-modules

connectDB()
  .then(() => {
    app.on("error from app.on", (err) => {
      console.error(err + "im from index.js");
      throw err;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("MONGODB CONNECTION FAILED: " + err));
// becuase connectDB is aysnc and will return a promise so when it is connected we will connect our serer

/*

import express from "express";
const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error", (err) =>{
        console.error(err);
        throw err;
    })
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR : ", error);
    throw err;
  }
})(); // thi is called effy methof in js where we deifne an call func at same timr
*/
