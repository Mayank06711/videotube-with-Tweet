import mongoose from "mongoose";

import { DB_NAME } from "../contants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(
      ` SEE me in src db index.js IF you Forgot
         /n DATABASE CONNECTION ESTABLISHED With DB Host !! ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(
      ` MONGODB CONNECTION FAILED: with data base: ${DB_NAME}  FROM db.index.js`,
      error
    );
    process.exit(1);
  }
};

export default connectDB;
