import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();

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


export default  router ;
