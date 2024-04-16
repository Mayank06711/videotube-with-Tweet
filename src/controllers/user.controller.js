/*--------------------IMPORTS--------------------*/

 import asyncHandler from "../utils/asyncHandler.js";
 import { ApiError } from "../utils/ApiError.js";
 import { User } from "../models/user.model.js";
 import { uploadOnCloudinary , deleteOnCloudinaryImage} from "../utils/cloudinary.fileupload.js";
 import { ApiResponse } from "../utils/ApiResponse.js";
 import  Jwt  from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";

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

  const avatarLocalPath = req.files?.avatar[0]?.path; // from multer we get this access i.e files and avatar[0] from multer will conatin path
  
  console.log(avatarLocalPath , req.files, "avatarLocalPath see me in USERCONTROLLER")
 
  //const coverImageLocalPath = req.files?.coverImage[0]?.path; // from multer we get this access , but we were nere not able to proceed further due to optional chainig i user does not upload coverimage it will be none and error will be thoworn
  let coverImageLocalPath;
  if (
     req.files && 
     Array.isArray(req.files.coverImage) 
     && req.files.coverImage.length > 0
     ){
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
  // console.log("huii 1111")
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
              $unset: {
                refreshToken: 1 //this remove field from databse
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
          //  console.log(req.user, "LOG OUT")
          return res
          .status(200)
          .clearCookie("refreshToken", options)
          .clearCookie("accessToken", options)
          .json(new ApiResponse(200, {}, "User Logged Out"))
  })
  
  /*------------------------Refreshing access token-----------------------*/

  //  The main purpose of the refreshAccessToken function is to refresh the access token for an authenticated user
  const refreshAccessTooken = asyncHandler(async (req, res)  => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    console.log(incomingRefreshToken, "incomingAccessToken in refreshAccessTooken");

    if (!incomingRefreshToken) {
      throw new ApiError(401,"Unathorized Access");
    }
                      // verify incoming refresh  token with one we have and other stored at database
    try {
       const decodedToken = Jwt.verify(
        incomingRefreshToken, 
       process.env.REFRESH_TOKEN_SECRET
       )
  
       console.log(decodedToken, "decodedToken in refreshAccessTooken");
  
      const user = await User.findById(decodedToken?._id) 
       //we have genearetd refreshtoken with only _id
      console.log(user, "user in refreshAccessTooken");
  
      if (!user) {
      throw new ApiError(401,"Invalid refreshToken");
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {   // ja aa raha wo user ke pass hona bhi chahiye i.e the incomingrefreshtoken must be same as the on which user have at database
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
       new ApiResponse(200,req.user,"Current user fetched successfully")
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
    
    const avatarLocalPath = req.file?.path;  // file not files bcz we only need one file i.e avatar and we have access to this bcz we have middelware named multer
    
    if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file not found : Upload avatar")
    }
    
     try {
      const avatar = await uploadOnCloudinary(avatarLocalPath);
      
      //console.log(avatar,"Avatar updated")
      if (!avatar.url) {
         throw new ApiError(400, "Error while uploading avatar")
      }
      
      const deleteUserAvatar = await User.findById(req.user?._id)
      // console.log("1" ,deleteUserAvatar
      
      if (deleteUserAvatar) {
       // console.log("2", avatar.url)
         await deleteOnCloudinaryImage(deleteUserAvatar.avatar);
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
       .json(new ApiResponse(200, user, "Your avatar has been updated"))
     } catch (error) {
       throw new ApiError(500,"Error while updating avatar")
     }
   
    })

  //  --------------- update coverImage  ---------------
  const updateUserCoverImage = asyncHandler(async (req, res) =>{
    
    const coverImageLocalPath = req.file?.path;  // file not files bcz we only need one file i.e avatar
    
    if(!coverImageLocalPath){
      throw new ApiError(400, "Cover image file not found : Upload cover image")
    }
    
     try {
      
      const coverImage = await uploadOnCloudinary(coverImageLocalPath);
      
      if (!coverImage.url) {
         throw new ApiError(400, "Error while uploading cover image")
      }
      
      const deleteUserCoverImage = await User.findById(req.user?._id)
      // console.log("1" ,deleteVideoCoverImage)
      
      if (deleteUserCoverImage) {
       // console.log("2", coverImage.url)
         await deleteOnCloudinaryImage(deleteUserCoverImage.coverImage);
      }

      // console.log("1", coverImage.url)
        const user = await User.findByIdAndUpdate(
         req.user._id,
         {
           $set:{
             coverImage:coverImage.url
           }
         },
         {new:true}      
       ).select("-password")
   console.log(user, "2")
     return res 
      .status(200)
      .json( new ApiResponse(200, user, "coverImage updated" ))
      
     } catch (error) {
       throw new ApiError(500,"Error while updating cover image")
     }
    })

  // ----------------------get user profile----------------------------

  const getUserChannelProfile =asyncHandler(async (req, res) =>{
    const {username} = req.params; // we are taking username form url not from body
    
    if (!username?.trim()) {
      throw new ApiError(400, "Username is missing");
    }
    console.log(username,"------------")
    const channel =await User.aggregate([ // EACH CURLY BARCKET IS A STAGE 
      {              // match the username
        $match:{
          username:username?.toLowerCase()
        }
      },
      { 
        $lookup:{  // this will give numbers of subsribers channel does have
          from:"subscriptions", // that mean from where to look here it is ->Subscription 
          localField:"_id", // from where to look here it is -> _id
          foreignField:"channel", // that what to see in subscription>
          as:"subscribers",
          // 	as-> Name of the new array field to add to the input documents. This new array field contains the matching documents from the from collection. If the specified name already exists as a field in the input document, that field is overwritten.
        }
      },
      {  // this will find nom of suncribed channel that channel owner has
          $lookup:{
            from:"subscriptions", 
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
          }
      },
      {
        $addFields: {  //to add new fields
                 subscriberCount: {
                      $size:"$subscribers"  //used dollor bcz it it(subscribers) now a field
                  },
                  cannelIsSubscribedToCount:{
                      $size:"$subscribedTo"
                  },
                  isSubscribed:{
                    $cond:{
                      if:{$in:[req.user?._id, "$subscribers.subscriber"]}, // here $subscribers is field that we added as object  and .subscriber is from model
                      then:true,
                      else:false
                    }
                  }
        }
      },
      {
        $project:{ // this is what we want to  To include any other fields from the input documents in the output documents, you must explicitly specify the inclusion in 
          username:1,
          fullName:1,
          subscriberCount:1,
          cannelIsSubscribedToCount:1,
          isSubscribed:1,
          avatar:1,
          coverImage:1,
        }
      }
    ])
   
     console.log("yuyuyuu",channel[0], "channel from channelpipleline")

     if (channel?.lenght === 0 || channel?.lenght === null || channel[0] === undefined ) { // channel[0] === udefined means usr is searching for channel which does not ecxist
         throw new ApiError(404, "channel deos not exists");
     }
      console.log(1111111)
     return res
     .status(200)
     .json(new ApiResponse(200, channel[0],"User channel fetched successfully" ));
  })

//  --------------watch history---------------------
    const getWatchHistory = asyncHandler(async (req, res)=>{
    // req.user._id   this will give string not mongodb id this is is converted by mongoose internally into mongodb id as objectId("")
     
    const user = await User.aggregate([
      {
        $match:{
          _id:new mongoose.Types.ObjectId(req.user._id),// bcz mongooose will not converted this into id
        }
      },
      {
        $lookup:{
          from:"videos", //our Video model will be saved as videos on mogodb
          localField:"watchHistory",
          foreignField:"_id",
          as:"watchHistory",
          pipeline:[
            {
              $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[ // everthing will be added to owner filed only
                  {
                    $project:{
                        username:1,
                        fullName:1,
                        avatar:1
                    }
                  }
                ]
              }
            },
            {
              $addFields:{
                owner:{
                  $first:"$owner"
                }
              }
            }
          ]
        }
      }
    ])
    
    return res
       .status(200)
       .json(
        new ApiResponse(
          200,
          user[0].watchHistory,
          "Watch History fetched"
          )
       )
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
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
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


/*------------------------------Pipelines and Aggrigation --------------------- */
/* 
// -------------------Aggregation-----------
Aggregation operations process multiple documents and return computed results. You can use aggregation operations to:

Group values from multiple documents(models) together.

Perform operations on the grouped data to return a single result.

Analyze data changes over time.

// -----------------pipeline ------------------------------
An aggregation pipeline consists of one or more stages that process  documents:

Each stage performs an operation on the "{INPUT DOCUMENTS}". For example, a stage can filter documents, group documents, and calculate values.

The {"DOCUMENTS THAT are OUTPUT FROM a STAGE"} are passed to the next stage.

An aggregation pipeline can return results for groups of documents. For example, return the total, average, maximum, and minimum values.
returns an ARRAY containing INFO
WRITTE IN {},{},{} IF USE THREE CURLY BRACES IT MEANS ADDED THREE PIPELINES AND THESE REPRESENT THREE STAGES
*/




// ---------------------- $project-----------
/*
In MongoDB, the $project operator is used in aggregation pipelines to reshape documents by including, excluding, or transforming fields. 
It allows you to specify which fields to include or exclude in the output documents,
as well as to create new fields or compute expressions.
*/
