


import  asyncHandler  from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import  {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.fileupload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // STEP-NO-1get the user details from the frontend here it is postman
    //STEP-NO-2 validate - not empty 
    //STEP-NO-3 check if the user already exists:username and email
    //STEP-NO-4 check for image: check for  avatar, bcz avatr is required in model of user
    //STEP-NO-5 upload them on cloudinary:avatar
    //STEP-NO-6 create a new user object : create entry in   db
    // STEP-NO-7 remove pass and refresh token from  response
    // STEP-NO-8 check for user creation
    //STEP-NO-9 return res

    const {fullName, email ,username, password} = req.body; // step1
    console.log("fullName email user : ",fullName , email , username , password)
    // STEP-NO-2 validate - not empty
    // if (fullName === "" || email === ""|| username === "" || password === "") {
    //     throw new ApiError(400, "All fields are required")
    // }
    if (
        [fullName, email, username, password].some((arrfield) => arrfield?.trim()==="")
    ) 
    {
        throw new ApiError(400, "All fields are required");
    }
    // Step 3
    const existedUser = User.findOne(
        {
            $or: [
                { email },
                { username },
            ],
        }
    )
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // step 4
     const avatarLocalPath = req.files?.avatar[0]?.path; // from multer we get this access 
     const cooverImageLocalPath = req.files?.cooverImagePath[0]?.path; // from multer we get this access
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required");
    }
     // step 5
     const avatar = await uploadOnCloudinary(avatarLocalPath);
     const coverImage = await uploadOnCloudinary(cooverImageLocalPath);
     if (!avatar) {
        throw new ApiError(400, 'avatar file is required');
     }
     // step 6
     const user = await User.create({
         fullName, 
         avatar:avatar.url,
         coverImage:coverImage?.url||"",
         email,
         password,
         username:username.toLowerCase(),
     });
     // step 7
     const createdUser = await User.findById(user._id).select(
         "-password -refreshToken"
     );
     // step 8
     if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registring the user");
     }

     // step 9
     return res.status(201).json(
            new ApiResponse(200, createdUser , "User successully registered")
     )
 });









export { 
    registerUser,
}
