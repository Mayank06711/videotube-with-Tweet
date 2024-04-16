import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

/*--------------------toggleVideoLike----------------*/

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    // TODO: Toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video id provided");
    }

    try {

        // Check if the user has already liked the video
    
        const existingLike = await Like.findOne({ video: videoId, likedBy: req.user._id });

        if (existingLike) {
            // User has already liked the video, remove the like
            await Like.deleteOne({ _id: existingLike._id });
            res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
        } else {
            // User has not liked the video, add the like
            const newLike = await Like.create({ video: videoId , likedBy: req.user._id , });
            res.status(200).json(new ApiResponse(200, newLike, "Like added successfully"));
        }
    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while toggling video like: Try again later");
    }
});//DONE!


/*-----------------toggleCommentLike----------------*/

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    // TODO: Toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "Invalid commentId");
    }

    try {
        // Check if the user has already liked the comment
        const existingLike = await Like.findOne({ comment: commentId , likedBy:req.user._id});

        if (existingLike) {
            // User has already liked the comment, remove the like
            await Like.deleteOne({ _id: existingLike._id });
            res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
        } else {
            // User has not liked the comment, add the like
            const newLike = await Like.create({ comment: commentId , likedBy:req.user._id });
            res.status(200).json(new ApiResponse(200, newLike, "Like added successfully"));
        }
    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while toggling comment like: Try again later");
    }
});//DONE!


/*--------------------toggleTweetLike-------------*/

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    // TODO: Toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Invalid tweetId provided: Provide a valid tweet id");
    }

    try {
        // Check if the user has already liked the tweet
        const existingLike = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });

        if (existingLike) {
            // User has already liked the tweet, remove the like
            await Like.deleteOne({ _id: existingLike._id });
            res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
        } else {
            // User has not liked the tweet, add the like
            const newLike = await Like.create({ tweet: tweetId, likedBy:req.user._id });
            res.status(200).json(new ApiResponse(200, newLike, "Like added successfully"));
        }
    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while toggling tweet like: Try again later");
    }
});//DONE!


/*--------------------getLikesVideos------------------*/

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
        const likedVideos = await Like.find({ video: { $ne: null }, likedBy: req.user._id }) // find all liked videos so pass without any argument
    
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


const getLikedComments = asyncHandler(async (req, res) => {
    // TODO: Get all liked comments
    try {
        const likedComments = await Like.find({ comment: { $ne: null } , likedBy: req.user._id}); // Find documents where the "comment" field is not empty
        
        if (!likedComments || likedComments.length === 0) {
            throw new ApiError(404, "No liked comments found");
        }
    
        res.status(200).json(new ApiResponse(200, likedComments, "Liked comments fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while getting liked comments");
    }
});//DONE!


const getLikedTweets = asyncHandler(async (req, res) => {
    // TODO: Get all liked tweets
    try {
        const likedTweets = await Like.find({ tweet: { $ne: null }, likedBy: req.user._id}); // Find documents where the "tweet" field is not empty
        
        if (!likedTweets || likedTweets.length === 0) {
            throw new ApiError(404, "No liked tweets found");
        }
    
        res.status(200).json(new ApiResponse(200, likedTweets, "Liked tweets fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while getting liked tweets");
    }
});//DONE!


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
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