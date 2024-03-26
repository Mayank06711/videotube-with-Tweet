import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

/*--------------------toggleVideoLike----------------*/

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!(videoId || isValidObjectId(videoId) )) {
        throw new ApiError(404, "No liked video found with given VideoId")
    }

    try {
        const likedVideo = await Like.findOneAndUpdate(
            {
                video:videoId
            },
            {
                video:""
            },
            {
                new :true,
                validateBeforeSave:false
            },
        )

        if (!likedVideo) {
            throw new ApiError(404,likedVideo, "No liked video found : Can no toggleLike on this video")
        }

        res
        .status(200)
        .json(new ApiResponse(200, likedVideo, "Like toggled successfully"))
        
    } catch (error) {
        throw new ApiError(500, error, "Some error  occured while toggling video: Try again later")
    }
})//DONE!

/*-----------------toggleCommentLike----------------*/

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!(commentId || isValidObjectId(commentId) )) {
        throw new ApiError(404, "No liked video found with given VideoId")
    }

    try {
        const likedComment = await Like.findOneAndUpdate(
            {
                comment:commentId
            },
            {
                comment:""
            },
            {
                new :true,
                validateBeforeSave:false
            },
        )

        if (!likedComment) {
            throw new ApiError(404,likedComment, "No liked Comment found : Can no toggleLike")
        }

        res
        .status(200)
        .json(new ApiResponse(200, likedComment, "Like toggled successfully"))
        
    } catch (error) {
        throw new ApiError(500, error, "Some error occured while toggling your liked comment: Try again later")
    }
})//DONE!

/*--------------------toggleTweetLike-------------*/

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!(tweetId || isValidObjectId(tweetId) )) {
        throw new ApiError(404, "No liked tweet found with given tweetId")
    }

    try {
        const likedTweet = await Like.findOneAndUpdate(
            {
                tweet:tweetId
            },
            {
                tweet:""
            },
            {
                new :true,
                validateBeforeSave:false
            },
        )

        if (!likedTweet) {
            throw new ApiError(404,likedTweet, "No liked video found : Can no toggleLike on this tweet")
        }

        res
        .status(200)
        .json(new ApiResponse(200, likedTweet, "Like toggled successfully"))
        
    } catch (error) {
        throw new ApiError(500, error, "Some error occured while toggling your tweetLike: Try again later")
    }
})//DONE!

/*--------------------getLikesVideos------------------*/

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    
})//DONE!

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}