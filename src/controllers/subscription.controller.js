import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


/*----------------------TOGGLESUBSCRIPTION----------------*/

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "Could not toggle subscription")
    }
  
    try {
        const subscription = await Subscription.findOne({channel:channelId})
    
        console.log(subscription,"subscription")

        if (!subscription) {
            throw new ApiError(404, "Could not find subscription")
        }

        if (req.user && subscription.subscriber) { 
            subscription.subscriber = "";
            await subscription.save();
            res
            .status(200)
            .json(new ApiResponse(200, subscription, "Subscription toggled successfully"))
        }

        else if (req.user) {
            subscription.subscriber = req.user._id;
            await subscription.save();
            res
            .status(200)
            .json(new ApiResponse(200, subscription, "Subscription toggled successfully"))
        }
        else {
            throw new ApiError(403, "User not authenticated")
        }
    } catch (error) {
        throw new ApiError(500, error, "Something went wrong while toggling your subscription: Try again later")
    }
    
})//DONE!


/*---------------------------GETUSERcHANNELSUBSCRIBERS-----------*/

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "Could not find channel")
    }

    try {
        const channelSubscriptions = await Subscription.find({channel:channelId}) 
        /* 
        channelSubscription is an array of subscription documents, 
        not a single document.
        So, we need to iterate over channelUsers to access each subscriber's ID.
         */

        if (!channelSubscriptions || channelSubscriptions.length === 0) {
            throw new ApiError(404, "No such channel exists")
        }
        
        const subscriberIds = channelSubscriptions.map(subscription => subscription.subscriber) //this will return array

        // The subscriberIds array contains the IDs of all subscribers to the specified channel.
        console.log(subscriberIds,"subcriberIds")

        res
        .status(200)
        .json(new ApiResponse(200,subscriberIds,"Channel Subscriber fetched successfully"));

    } catch (error) {
        throw new ApiError(500, error, "Something went wrong while getting subscribers :Please try again later")
    }
})//DONE!


/*------------------------GETSUBSCRIBERcHANNELS----------------*/

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(404, "Could not find user with given subscriber")
    }

    try {
        const userSubscriptions = await Subscription.find({subscriber:subscriberId}) 
        /* 
        userSubscription is an array of subscription documents, 
        not a single document.
        So, we need to iterate over Usersubscription to access each channel`s ID.
         */

        if (!userSubscriptions || userSubscriptions.length === 0) {
            throw new ApiError(404, "You have not subscribed to any channels")
        }
        
        const channelIds = userSubscriptions.map(subscription => subscription.channel) //this will return array

        // The channelIds array contains the IDs of all channels which are being subscribed by user.
        console.log(channelIds,"channelIds")
        
        res
        .status(200)
        .json(new ApiResponse(200,channelIds,"Subscribed channels fetched successfully"));

    } catch (error) {
        throw new ApiError(500, error, "Something went wrong while getting subscribers :Please try again later")
    }
})//DONE!


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}