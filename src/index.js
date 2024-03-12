// require('dotenv').config({ path: ".env" });
import dotenv from "dotenv";

import connectDB from "./db/index.js";

dotenv.config({
   path: ".env"
   }); // we have add this in package json file under dev -r dotenv/config --experimental-json-modules

connectDB();
































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
