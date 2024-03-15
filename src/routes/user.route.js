import { Router } from "express";
import { registerUser , loginUser,logoutUser } from "../controllers/user.controller.js";
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


export default  router ;
