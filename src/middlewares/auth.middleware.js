
// ----importing required modules and mehtod
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
/* ---------- creating middle ware to get user info  */


export const verifyJWT = asyncHandler(async (req, _, next) => {
   //Access token from cookies if  available
   //In case of mobile users, tokens are sent in headers, replace("Bearer ", "") Bearer and a single space wiht empty string bcz from client side, Authorization: Bearer <token> ,token is accesstoken
   //For more information on JSON Web Tokens, visit: https://jwt.io/introduction 
   
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

     console.log(token, "access token from cookies auth middleware remove me if done");

     if (!token) {
             console.log("token from cookies auth middle")
         throw new ApiError(401, "Unathorized Request")
     }

     // -------------------------------decode token using secret access key 
     const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     console.log(decodedToken, "decodedAccessToken from secret authmiddleware remove me if done");
     
     // ----- get user by id that we have set in userSchema as jwt.sign _id
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
     if (!user) {
         throw new ApiError(401, "Invalid  access token")
     }
 
     //add object to request name user and value user(that we found here using byid)
     req.user = user;  
     next(); // flag for nex
   } 
   catch (error) {
     throw new ApiError(401, error?.message || "invalid access token");
   } 
})



// -------used in roiutes