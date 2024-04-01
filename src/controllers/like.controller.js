import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

/*--------------------toggleVideoLike----------------*/

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video id provided")
    }

    try {
        const likedVideo = await Like.findOneAndUpdate(
            { video: videoId },
            { video: "" },
            { new: true, validateBeforeSave: false },
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
    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "Invalid commentId")
    }

    try {
        const likedComment = await Like.findOneAndUpdate(
            { comment: commentId },
            { comment: "" },
            { new: true, validateBeforeSave : false},
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
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Invalid tweetId provided : Provide valid tweet id")
    }

    try {
        const likedTweet = await Like.findOneAndUpdate(
            { tweet: tweetId },
            { tweet: "" },
            { new: true, validateBeforeSave: false },
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
    try {
        const likedVideos = await Like.find() // find al liked videos so pass without any argument
    
        if (!likedVideos || likedVideos.length === 0) {
            throw new ApiError(404, "No liked videos found")
        }
    
        res
       .status(200)
       .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error, "Some error occured while getting liked videos")
    }

})//DONE!

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}


//------------------DEFINITION--------------------------------
/*
In the provided code, Like.find() is a method call made on the Mongoose model Like. 
Here's what it does:

Like.find(): This Mongoose method is used to find documents in the Like 
collection that match the specified criteria. When called without any
arguments, it returns all documents in the collection.

After executing Like.find(), the returned value will be an array containing 
all the liked video documents found in the Like collection. This array
will be assigned to the videos variable in the code, 
which can then be processed further or sent back as a response to the clie
*/