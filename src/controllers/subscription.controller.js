import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

/*-------------------Create Subscription document-------------*/

const createChannel = asyncHandler(async (req, res) => {
    const { user_Id } = req.params;

    if (!isValidObjectId(user_Id)) {
    throw new ApiError(404, "Invalid channel id :Try with valid id")        
    }

    try {
        const createdUserChannel = await Subscription.create(
            {
                channel: user_Id,
                subscriber:null
            }
        )

        if (!createdUserChannel) {
            throw new ApiError(404, "Couldn't create channel subscription")
        }

        res
        .status(201)
        .json(new ApiResponse(201, createdUserChannel, "Your Videotube channel has been created successfully : "))
    } catch (error) {
        throw new ApiError(500, error, "Something went wrong while creating your subscription")
    }
})//DONE!


/*----------------------TOGGLESUBSCRIPTION----------------*/

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channel_Id } = req.params;

    // TODO: toggle subscription
    if (!isValidObjectId(channel_Id)) {
        throw new ApiError(404, "Enter valid channel_Id to toggle subscription")
    }
  
    try {
        const subscription = await Subscription.findOne({_id:channel_Id})
    
        console.log(subscription,"subscription")

        if (!subscription) {
            throw new ApiError(404, "Could not find channel for toggling subscription")
        }
        
        if (subscription.channel.toString() === req.user._id.toString()) {
            throw new ApiError(404, "You can not toggle subscription of  your own channel")
        }

        if (req.user && subscription.subscriber) { 
            subscription.subscriber = null;
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
    const { channel_Id } = req.params
    
    if (!isValidObjectId(channel_Id)) {
        throw new ApiError(404, "Tyr againn with valid channel id")
    }

    try {
        const channelSubscriptions = await Subscription.find({channel:channel_Id}) 
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
        throw new ApiError(404, "Try again with a valid subscriber id")
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
    createChannel,
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}






/*---------------------IMP DEFINITION--------------*/
/*
//--------------------ROUTE PARAMTERED METHODS--------------------`
Definition: 
Route parameters are part of the URL path and are defined in the route pattern using a colon (:) followed by the parameter name. For example, /users/:userId defines a route parameter named userId.
Usage: 
Route parameters are used to extract dynamic values from the URL path. These values can change with each request, and they are typically used to identify a specific resource or entity.
Access: 
In Express.js, route parameters are accessible via the req.params object. For example, if you define a route parameter :userId, you can access its value using req.params.userId.
Example: 
/users/:userId matches URLs like /users/123, /users/456, where 123 and 456 are values of the userId parameter.

//------------------------QUERY PARAMETERS------------------------
Definition: 
Query parameters are key-value pairs appended to the URL after a question mark (?). Each parameter is separated by an ampersand (&). For example, ?page=1&limit=10 contains two query parameters: page with a value of 1 and limit with a value of 10.
Usage:
 Query parameters are used to provide additional data to a server when making an HTTP request. They are often used for filtering, sorting, or pagination purposes.
Access:
 In Express.js, query parameters are accessible via the req.query object. For example, if a client sends a request with query parameters ?page=1&limit=10, you can access them using req.query.page and req.query.limit.
Example:
 /users?page=1&limit=10 contains query parameters page and limit, which are used to specify the page number and the number of results per page, respectively.


 //--------------------SUMMARY--------------------
 In summary, route parameters are part of the URL path and are used for dynamic values, while query parameters are appended to the URL and are used for additional data in an HTTP request. They serve different purposes and are accessed differently in Express.js.
*/