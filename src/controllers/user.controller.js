/*--------------------IMPORTS--------------------*/

 import asyncHandler from "../utils/asyncHandler.js";
 import { ApiError } from "../utils/apiError.js";
 import { User } from "../models/user.model.js";
 import { uploadOnCloudinary } from "../utils/cloudinary.fileupload.js";
 import { ApiResponse } from "../utils/ApiResponse.js";
 import { Jwt } from "jsonwebtoken";


/*----CREATING METHOD FRO ACCESS AND REFRESH TOKEN----*/

 /**
 * Generates access and refresh tokens for a given user ID.
 * @param {string} userId - The ID of the user for whom tokens are to be generated.
 * @returns {object} An object containing the access and refresh tokens.
 * @throws {ApiError} Throws an error if there's an issue generating tokens.
 */

  const createAccessAndRefreshToken = async (userId) => {
   try {
    // Find the user by ID
     const user = await User.findById(userId);
    
     // Generate access and refresh tokens
     const accessToken = user.generateAccessToken();
     const refreshToken = user.generateRefreshToken();
    
    // Assign refresh token to user and save
     user.refreshToken = refreshToken;
     await user.save({ validateBeforeSave: false });
    
    // Return the generated tokens
     return { accessToken, refreshToken };
  } catch (error) {
    // Throw an error if there's an issue generating tokens
     throw new ApiError(500, "Something went wrong, Error creating access and refresh token");
  }
}



 /*--------------------USER REGISTER------------------*/

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

 

 /*--------------------------------LOGIN USER-------------------------------- */
  const loginUser = asyncHandler(async (req, res) => {

                       // step to login
              // get data from req body
              // username or email based login 
              //if  username or email is not provided error
              // check if user exists
              // password check
              //access and refresh token
              // send secure cookies
              // return res
//------------step 1
    const {email, username, password} = req.body;
  console.log(email, username, password, "req.body in loginUser"); 
  //---------- step 2 
  if (!(username || email)) {
    throw new ApiError(400, "username or email is reqiuired");
  }
//------------ step 3
  const user = await User.findOne({
    $or:[{username}, {email}] // means find a user with either email or username
  })

  if (!user) {
    throw new ApiError(404, "User does not exist : Can't login");
  }

               //-------step 4 check password

  // const isPasswordCorrect = await user.isPasswordCorrect(password);
  //  suggests that you're calling an instance method isPasswordCorrect on a specific user instance THAT WE GET FROM our DATABSE "user" here, not User.
  // const isPasswordCorrect = await User.isPasswordCorrect(password) suggests that you're calling a 
  // static method isPasswordCorrect  directly on the User model class 


  const isPasswordValid =  await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Password does not match with your old password : Try again");
  }

  /*------------------Step 5 access and refresh token to the user----------------------*/ 
    const {accessToken, refreshToken} = await createAccessAndRefreshToken(user._id);

     console.log(accessToken, refreshToken, "accessToken and refreshToken in loginUser");

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken");

    //  -- above {user} nd {loggedInUser} are different becuase above user will have empty refreshToken field {see user model} bcz we haven't specified refreshtoken earlier
    console.log(user, loggedInUser, "user ,  loggedInUser see diffrence"); 
     
     const options= {  // since by default cookies can be mmodified by anyone from frint-end or server so by doing this sookies can only be modified from server side
      httpOnly: true,
      secure:true,
     }
    
/*------------------STEP-6 RETURN RESPONSE-------------*/

     return res.
     status(200). 
     cookie("refreshToken", refreshToken, options). // BCZ WE HAVE INSTALLED COOKIE-PARSER and we have inserted middleware cookie-parser() on app.cookie-parser() 
     cookie("accessToken",accessToken, options). // cookies are two way that can be useed with req and res both
     json(
       new ApiResponse(
         200, // status code
         { // data returned that we wanted
          user: loggedInUser,
          accessToken,
          refreshToken,
         },
         "User successfully logged in" // success message
       )
     )
  })

 /*---------------------------------LOGOUT USER---------------------------------*/
  const logoutUser = asyncHandler(async (req, res) => {
         // CONST USER = AWAIT USER.FINDById(USER_ID) BUT WE CAN NOT DO THIS BCZ USER SHOULD NOT ENTER EMAIL OR REQUIRED DETAILS TO LOG OUT 
         // SO WE NEED MIDDLE WARE TO GIVE AS USER DETAILS FROM REQ THAT WHERE AUTHMIDDLEWARE COME IN HANDY
        //   WHERE WE ADD AN OBJECT INTO REQ WHILE LOGOUT REQ

/* -------------STEPS TO LOG  OUT --------------------------------*/ 
          // step 1: ----  taking user datails from req.user that we have added while as middleware while logout request
         await  User.findByIdAndUpdate(
            req.user._id, 
            {
              $set: {
                refreshToken: undefined
              }
            },
            {
              new: true, // to get updated new value with a refresh token as undefined otherqise we will get same value of refresh token
            }
          ) 
          //  -clear cookies
          const options = {
            httpOnly: true,
            secure: true,
          }
          // console.log(req.user, "LOG OUT")
          return res
          .status(200)
          .clearCookie("refreshToken", options)
          .clearCookie("accessToken", options)
          .json(new ApiResponse(200, {}, "User Logged Out"))
  })
  
  /*------------------------Refreshing access token-----------------------*/

  //  The main purpose of the refreshAccessToken function is to refresh the access token for an authenticated user
  const refreshAccessTooken = asyncHandler(async (req, res)  => {

    const incomingAccessToken = req.cookies.accessToken || req.body;

    console.log(incomingAccessToken, "incomingAccessToken in refreshAccessTooken");

    if (!incomingAccessToken) {
      throw new ApiError(401,"Unathorized Access");
    }
                      // verify incoming refresh  token with one we have and other stored at database
    try {
       const decodedToken = Jwt.verify(
       incomingAccessToken, 
       process.env.REFRESH_TOKEN_SECRET
       )
  
       console.log(decodedToken, "decodedToken in refreshAccessTooken");
  
      const user = await User.findById(decodedToken?._id) 
       //we have genearetd refreshtoken with only _id
      console.log(user, "user in refreshAccessTooken");
  
      if (!user) {
      throw new ApiError(401,"Invalid refreshToken");
      }
  
      if (incomingAccessToken !== user?.refreshToken) {   // ja aa raha wo user ke pass hona bhi chahiye i.e the incomingrefreshtoken must be same as the on which user have at database
         throw new ApiError(401,"Refresh token is expired or used"); 
      }
  
       const options = {
        httpOnly: true,
        secure: true,
       }
  
     const {accessToken, newRefreshToken} =  await createAccessAndRefreshToken(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user,
            accessToken,
            refreshToken:newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      )
    } catch (error) {
      throw new ApiError(401, error?.message||"Invalid newrefresh token")
    }

  })
   

  /*-----------------------Changing old password---------------*/

  const changeCurrentPassword = asyncHandler(async (req, res)  => {
       
    //take  old password and new and confrimnewpas from user 
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if (!(newPassword === confirmPassword)) {
      throw new ApiError(400, "newPassword does match confirm password")
    }
    console.log(oldPassword, newPassword, "oldPassword and newPassword in changeCurrentPassword");
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "oldPassword and newPassword are reqiuired");
    }

    // now find user to update its oldpassword
   
      const user = await User.findById(req.user._id); // bcz while login we have added user in as obj in req through auth midd
      const isPasswordValid =  await user.isPasswordCorrect(oldPassword); // method we declared in schema
      if (!isPasswordValid) {
        throw new ApiError(404, "Password does not match with your old password : Try again");
      }

      //  update user password and save new password

      user.password = newPassword
      await user.save({validateBeforeSave:false})

      return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password updated"))
  })

  // -----------------Get current user ----------------

  const getCurrentUser = asyncHandler(async (req, res)  => {
      return res
      .status(200)
      .json(
        200, req.user,"Current user fetched successfully"
      )
  })


  // ---------------UPDATE USER DETAILS ----------------
   const updateUserDetails = asyncHandler(async (req, res) => {
       const {fullName, email} = req.body;
       console.log(fullName, email);

       if (!(fullName || email)) {
        throw new ApiError(401, "All fields are required")
       }
      
     const user =  await User.findByIdAndUpdate(
        req.user?._id, 
          {
           $set:{
             fullName:fullName, 
             email:email
             }
          },
          { new: true }
        ).select("-password")

        return res 
        .status(200)
        .json(new ApiResponse(200, user,"User details Updated" ))
   })


  //  --------------------Update user Avatar-----------------------
   const updateUserAvatar = asyncHandler(async (req, res) =>{
    
    const avatarLocalPath = req.file?.path;  // file not files bcz we only need one file i.e avatar
    
    if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file not found : Upload avatar")
    }
    
     const avatar = await uploadOnCloudinary(avatarLocalPath);

     if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
     }

   const user =   await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          avatar:avatar.url
        }
      },
      {new:true}
      ).select("-password")
      
      return res 
      .status(200)
      .json(200, user,"Avatar successfully updated")
   })

  //  --------------- update coverImage ---------------
  const updateUserCoverImage = asyncHandler(async (req, res) =>{
    
    const coverImageLocalPath = req.file?.path;  // file not files bcz we only need one file i.e avatar
    
    if(!coverImageLocalPath){
      throw new ApiError(400, "Cover image file not found : Upload cover image")
    }
    
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

     if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image")
     }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            coverImage:coverImage.url
          }
        },
        {new:true}      
    ).select("-password")

    return res 
  .status(200)
  .json( new ApiResponse(200, user, "coverImage updated"))
  })



  /*------------------------EXPORT-----------------------*/ 
 export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessTooken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage
 };





 /*----------------------------DEFINITIONS IMP----------------------------*/

 /*----------------------------------REFRESH VS ACCESS TOKEN--------------------------*/
 /*
 RERESH TOKEN--
 A refresh token is a special type of token that is used to obtain a new access token when the current access token expires. 
 It has a longer lifespan compared to an access token and is typically used to maintain long-term authentication sessions.
  Refresh tokens are securely stored and used by the client application to request a new access token from the authorization server without requiring the user to reauthenticate.
 ACCESS TOKEN--
  An access token is a short-lived token that is used to authenticate requests to protected resources on behalf of the user.
  It has a shorter lifespan compared to a refresh token and is typically used for short-term authorization.
  Access tokens are issued by the authorization server after successful authentication and are included in each request to access protected resources.
   SUMMARY
 The lifespan of a refresh token is generally longer than that of an access token,
  and they serve different purposes in the authentication process.
   Refresh tokens are used to obtain new access tokens, while access tokens are used to access protected resources.
 */

/* ---------------------------------------COOKIE-----------------------------------------------*/
   /* A cookie is a small piece of data sent from a website and stored 
   on the user's computer by the user's web browser while the user is browsing. 
   It allows the server to store user information.
 */
