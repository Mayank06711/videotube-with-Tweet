import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

/*--------------------------CAHNNELStats------------------*/

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
     try {
        const channelStats = [] ;
        if(req.user) {
            //----------------numOfsubscribers--------------------
           const subscription = await Subscription.find({channel:req.user._id}) //array

           if (!subscription || subscription.length === 0) {
               throw new ApiError(404, "Channel not found")
           }
           
           const subscribers =  subscription.map(subscription=>subscription.subscriber)

           const numOfSubscribers = subscribers.length
           
           channelStats.push(numOfSubscribers)

           //-------------numOfVideos------------------

           const videos = await Video.find({owner:req.user._id, isPublished:true}) // will return array
            
           let numOfVideos = 0

           if (!videos || videos.length === 0) {
               channelStats.push(0)
           }
           else {
            numOfVideos = videos.length

            channelStats.push(numOfVideos)
            let totalView = 0
            //console.log(totalView)
            const views = videos.map(views =>totalView= totalView+views.view) //
           // console.log(views, views.length, totalView)
            channelStats.push(totalView)
           }

           //-------------numOfLikes-------------------
           // find number of likes a channel does have on his videos
           let videolikes = 0
           
           for (const video of videos) {
             const likes = await Like.find({video:video._id})
             videolikes += likes.length
           }

           channelStats.push(videolikes)

           res
           .status(200)
           .json(new ApiResponse(200, `numOfSubscribers: ${channelStats[0]} , numOfVideos : ${channelStats[1]} , numOfViews: ${channelStats[2]} , numOfLikes: ${channelStats[3]}`, "Channel Stats has been fetched successfully"))
       }
       else{
        throw new ApiError(403, "User not logged in : Login with channel official credentials")
       }
     } catch (error) {
        throw new ApiError(500, error, "Some error occurred while getting the channel stats: Please try again later")
     }
})//DONE!


/*--------------------------ALLVIDEOSOFACAHNNEL------------------*/


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    try {
        let channelVideos

        if (req.user) {
        //console.log(req.user._id, "user")
         channelVideos  = await Video.find({owner:req.user._id})
        }

        if (!channelVideos || channelVideos.length === 0) {
            throw new ApiError(404, `No videos exist for channel of user: ${req.user.username}`)
        }

        res
        .status(200)
        .json(new ApiResponse(200, channelVideos, "Channel videos fetched successfully"))

    } catch (error) {
        throw new ApiError(404, error, "Some error occurred while fetching video your videos")
    }
})//DONE!


export {
    getChannelStats, 
    getChannelVideos
}



