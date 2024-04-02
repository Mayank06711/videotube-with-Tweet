import {Router} from "express"

import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
} from "../controllers/like.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file bcz auth user can only like or dislike

router.route("/toggle/v/:videoId").post(toggleVideoLike);

router.route("/toggle/c/:commentId").post(toggleCommentLike);

router.route("/toggle/t/:tweetId").post(toggleTweetLike);

router.route("/videos").get(getLikedVideos);

router.route("/comments").get(getLikedComments);

router.route("/tweets").get(getLikedTweets);

export default router