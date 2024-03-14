

 import asyncHandler from "../utils/asyncHandler.js";
 import { ApiError } from "../utils/apiError.js";
 import { User } from "../models/user.model.js";
 import { uploadOnCloudinary } from "../utils/cloudinary.fileupload.js";
 import { ApiResponse } from "../utils/ApiResponse.js";


 const registerUser = asyncHandler(async (req, res) => {

      //STEP-NO-2 validate - not empty
      // STEP-NO-1get the user details from the frontend here it is postman
      //STEP-NO-3 check if the user already exists:username and email
      //STEP-NO-4 check for image: check for  avatar, bcz avatr is required in model of user
      //STEP-NO-5 upload them on cloudinary:avatar
      //STEP-NO-6 create a new user object : create entry in   db
      // STEP-NO-7 remove pass and refresh token from  response
      // STEP-NO-8 check for user creation
      //STEP-NO-9 return res

                                   // step1

 const { fullName, email, username, password } = req.body; 
console.log("fullName email user password : ", fullName, email, username, password);

                        // STEP-NO-2 validate - not empty

   if (
    [fullName, email, username, password].some(
      (fields) => fields?.trim() === ""
    )
   ) {
    throw new ApiError(400, "All fields are required");
  }

                            // Step 3

  const existedUser =await User.findOne({
    $or: [{ email }, { username }],
  });
  console.log(existedUser, "existedUser");
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

                          // step 4

  const avatarLocalPath = req.files?.avatar[0]?.path; // from multer we get this access
  
  console.log(avatarLocalPath , req.files, "avatarLocalPath see me in USERCONTROLLER")
 
  //const coverImageLocalPath = req.files?.coverImage[0]?.path; // from multer we get this access , but we were nere not able to proceed further due to optional chainig i user does not upload coverimage it will be none and error will be thoworn
  let coverImageLocalPath;
  if (
     req.files && 
     Array.isArray(req.files.coverImage) 
     && req.files.coverImage.length > 0
     ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  console.log(coverImageLocalPath, "coverImagePath SEEE ME IN USER CONTROLLER")
  
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

                          // step 5

  const avatar = await uploadOnCloudinary(avatarLocalPath);
 
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
 
  console.log(coverImage , "coverImage is console.log");
 
  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }
  console.log("huii 1111")
                      // step 6 - create a new user on db
  
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  console.log("huii 3333 ")
  console.log(password, "password is");
                         // step 7 find created user
  
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.log("created user ")
                        // step 8 check if user exists
  
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registring the user");
  }
  console.log("User created and registered successfully before step 9 is called");
  
                         // step 9 return the user response
  
   return res
     .status(201)
     .json(new ApiResponse(200, createdUser, "User successully registered"));
   });

    
  export { registerUser };
