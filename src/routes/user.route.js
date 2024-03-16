import { Router } from "express";
import {
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
    } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// ------ register user

router.route("/register").post(
    // Middleware to handle file uploads for avatar and coverImage fields
    upload.fields(
       [{
            name: "avatar", // Field name for avatar
            maxLength: 1 // Maximum number of files allowed for avatar (1 in this case)
        },
        {
            name: "coverImage", // Field name for coverImage
            maxLength: 1 // Maximum number of files allowed for coverImage (1 in this case)
        }]
    ),
    // Handler function for registering user
    registerUser
);

// ------- login user
router.route("/login").post(loginUser);

// secure routes
// ----------- logout user
router.route("/logout").post(verifyJWT ,logoutUser);

router.route("/refresh-token").post(refreshAccessTooken);

router.route("/change-password").port(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router
.route("/update-account")
.patch(verifyJWT, updateUserDetails) //if post all details will be chnaged

router
.route("/avatar")
.patch(verifyJWT, upload.single("avatar"),updateUserAvatar)

router
.route("/cover-image")
.patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router
.route("/c/:username")
.get(verifyJWT, getUserChannelProfile) // here we added route as username same as we have in channelprofile bcz we are getting this in userChannel thoru req.params i.e url

router
.route("/history")
.get(verifyJWT,getWatchHistory)

export default  router ;
