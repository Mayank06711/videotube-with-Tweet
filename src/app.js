import express from "express";
import cors from "cors"; // Importing the 'cors' middleware
import cookieParser from "cookie-parser";

const app = express();

// Adding the CORS middleware to your Express application

app.use(
  cors({
    // origin: Specifies which origins are allowed to access the resources on your server.
    // Setting the allowed origin(s) for cross-origin requests
    // 'process.env.COR_ORIGIN' should contain the actual origin(s) in production
    origin: process.env.COR_ORIGIN,

    // Allowing credentials to be included in cross-origin requests
    // (e.g., when using cookies or HTTP authentication)
    credentials: true,
  })
);

// Adding middleware to parse incoming JSON requests with a maximum limit of 20KB

app.use(express.json({ limit: "20kb" })); //form bhara to data liya

// Adding middleware to parse incoming URL-encoded form data with extended option

app.use(express.urlencoded({ extended: true, limit: "20kb" })); // this will use will data come form url and it will encode special character like space = %20 and other

app.use(express.static("public")); // serve static content from static folder

app.use(cookieParser()); // to perfomr CRUD OPER ON USER WEB COOKIES

// importing routes
import userRouter from "./routes/user.route.js";

// route declarations

// Mounting the userRouter middleware at the "/api/v1/users" endpoint
app.use("/api/v1/users", userRouter);   // here api/v1/users routes will act as prefix and controll will go to userRegister


// http://localhost/api/v1/users/*
export { app };
