import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.fileupload.js"

// you have not calculated no of vides a video will have that you need to calculate

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, user_Id } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (!(query || isValidObjectId(user_Id))) {
        throw new ApiError(400, "Required field: query or userId")
    }
    console.log(query, sortType, sortBy, sort, user_Id,"query, sortType, sortBy, sortBy")
    try{
      // Parse page and limit parameters
      const pageNumber = parseInt(page);
      const pageLimit = parseInt(limit);

      // Calculate the skip value for pagination
      const skip = (pageNumber - 1) * pageLimit;
     
       console.log(pageLimit, skip, pageLimit, "from video pagelimit")
      // creating pipelines
      let pipeline = [
           {
             $match: {
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { owner: mongoose.Types.ObjectId(user_Id) }
            ]
          }/* This stage matches documents based on the specified criteria: matching the title or description fields using case-insensitive regular expressions ($regex), or matching the owner field with the provided user_Id*/
       },

           {
             $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
          pipeline:[
            {
                $project: {
                   username:1,
                   fullName:1,
                   avatar:1,
                   coverImage:1,
                   email:1
                   
                }
            },
            {
                $addFields:{
                    ownerDetails:{
                    $first:"$ownerDetails"
                }
            }
            }
          ],
          
           }/*This stage performs a left outer join with the "users" collection.It adds a new field to each document called "owner", which contains the details of the user who owns the video.The localField specifies the field from the current collection (Video) to match.The foreignField specifies the field from the "users" collection to match.The as option specifies the name of the field to add to each document.Overall, this pipeline is used to retrieve videos based on the provided query and include information about the owner of each video by performing a lookup operation with the "users" collection.*/
       },

           {
             $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "video",
          as: "commentsOnVideo",
          pipeline:[
            {
                $project: {
                   content: 1,
                },
            },  
             { 
                 $addFields:{
                   commentsOnVideo:{
                     $first:"$commentsOnVideo"
                }
              }
            }
          ]
            }/*This stage performs a left outer join with the "comments" collection.It adds a new field to each document called "comments", which contains the comments made on the video.The localField specifies the field from the current collection (Video) to match.The foreignField specifies the field from the "comments" collection to match.The as option specifies the name of the field to add to each document.Overall, this pipeline is used to retrieve videos based on the provided query and include information about the owner of each video by performing a lookup operation with the "users" collection.*/
       },

            {  
             $lookup:{
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "likesOnVideo",
            pipeline:[
                {
                    $project: {
                       tweet:1,
                       likedBy:1,
                       comment:1 
                    },
                },
                {
                    $addFields:{
                        likesOnVideo:"$likesOnVideo" // all the likes on each video
                    }
                }
            ]
           } /* This stage performs a left outer join with likes */
       },

            {
             $lookup:{
        from: "playlists",
        localField: "_id",
        foreignField: "video",
        as: "PlaylistsOnVideo",
        pipeline:[
                {
                    $project:{
                    title:1,
                    description:1,
                    owner:1
                }
             },{
                $addFields:{
                    PlaylistsOnVideo:"$PlaylistsOnVideo" // all the playlists on each video
                }
             }
        ]
         }/*this stage performs same things as above on playlist */
       }, 

           {
            $sort:{
                $or: [
                    { [sortBy]: sortType === "desc" ? -1 : 1 },
                    { createdAt: -1 } // Sort by createdAt in descending order as an option newest first
                  ]
          } //sort by ascending or descending order
      },

       // Skip documents for pagination
       { $skip: skip },

       // Limit documents for pagination
       { $limit: pageLimit }
   ]
     console.log(pipeline, "pipeline of videos");  
    if (!pipeline || pipeline.length === null ) {
        throw new ApiError(500, "Loading Failed : Please try again later")
    }

    const video = await Video.aggregate(pipeline);

    console.log(video, "from pipeline getallvideos")

    if (!(video || video.length === (0 || null))) {
        throw new ApiError(500, "Failed to getallvideos. Please try again later")
    }
    res
    .status(200)
    .json(new ApiResponse(200, video, "Video Retrived Successfully"))
    
     } catch (error) {
    throw new ApiError(500,error, "Some error occurred while getting your video") 
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!(title || description || duration)) {
        throw new ApiError(400, "Required fileds: title and description")
    }
    
    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    console.log(videoLocalPath,"----", thumbnailLocalPath, title, description, "FROM PUBLISH video")

    if (!(videoLocalPath || thumbnailLocalPath)) {
        throw new ApiError(400, "Video and thumbnail are required: please provide video and thumbanil")
    }
    
    try 
      {
        const videoUploaded = await uploadOnCloudinary(videoLocalPath)
        const thumbanilUploaded = await uploadOnCloudinary(thumbnailLocalPath)
        console.log(videoUploaded, thumbanilUploaded, "1111")
        if (!(videoUploaded.url && thumbanilUploaded.url)) {
            throw new ApiError(400, "Video and thumbanil is required")
        }
        console.log("22222")
        const newVideo = await Video.create(
            {
                title,
                description,
                duration: videoUploaded.duration,
                videoFile: videoUploaded.url,
                thumbnail: thumbanilUploaded.url,
                isPublished:true,
                owner: req.user?._id // bcz we have added useer object thoru veirfyjwt 
            }
        );

     if (!newVideo) {
          throw new ApiError(400, "Video couldn't be created")
        }
     
    const createdVideo = await Video.findById(newVideo._id);

    console.log(createdVideo, "Video created")
      
    if (!createdVideo) {
        throw new ApiError(500, "Video couldn't be created")
    }
    res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "Video uploaded successfully uploaded"))
      }catch (error) {
        throw new ApiError(500,error, "Some error occurred while publishing video")
    }
})

/*-----------------GETVIDEOBYID----------------- */
const getVideoById = asyncHandler(async (req, res) => {
    const { video_id } = req.params
    //TODO: get video by id
    if (!video_id) {
        throw new ApiError(400, "Please enter videoId")
    }
    const video = await Video.findById(video_id);
    console.log(video, "getvideoById")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    res
    .status(200)
    .json(new ApiResponse(200, video, "got your video"))
})

/*----------------UPDATEVIDEO-----------------*/
const updateVideo = asyncHandler(async (req, res) => {
    const { video_Id } = req.params
    //TODO: update video details like title, description, thumbnail
    console.log(video_Id, "update Video with id")

    if (!video_Id) {
        throw new ApiError(400, "Invalid video id: Cannot update video")
    }
     const {title, description} = req.body
     const thumbnailLocalPath = req.file?.path
    if (!title || !description || !thumbnailLocalPath) {
        throw new ApiError(400, "title, description and thumbnail are required ")
    } 
    
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail.url) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }
     
    const video =  await Video.findByIdAndUpdate(
        video_Id, 
        {
            $set:
            {
                title:title,
                description:description,
                thumbnail:thumbnail.url || ""
            }
        },
        {new:true}
    )

    console.log(video, "video updated")
    if (!video) {
         throw new ApiError(404, "Video can not be updated")
    }
    res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successully"))
})

/*------------------DELETE---------------------*/
const deleteVideo = asyncHandler(async (req, res) => {
    const { video_Id } = req.params
    //TODO: delete video
    if (!video_Id) {
        throw new ApiError(404, "enter valid video id to know delete status") 
    }

    const video = await Video.findByIdAndDelete(video_Id)

    console.log(video, "video")
    if (!video) {
        throw new ApiError(404, "Video can not be deleted")
    }
    res
    .status(200)
    .json(new ApiResponse(200, video, "Video Deleted"))

})

/*----------------tigglePublishStatus----------------*/
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { video_Id } = req.params
    console.log(video_Id, "video id")
    if (!video_Id) {
        throw new ApiError(404, "enter valid video id to know publish status") 
    }
    const video = await Video.findById(video_Id)
    console.log(video, "video")

    if (!video) {
        throw new ApiError(400, "can not toggle publish status")
    }

    video.isPublished =!video.isPublished
    await  video.save({ validateBeforeSave: false })

    res
    .status(200)
    .json(new ApiResponse(200, video_Id, "Video status toggles successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}





// ------------------------------------------DEFINATION--------------------------------
 
/* ---------------------------REQ.PARAMS AND REQ.BODY---------------------*/
  /*
In HTTP requests, both request parameters (accessed via req.params) and 
request body data (accessed via req.body) can be sent simultaneously.
This is useful for providing additional information in the request body 
while specifying the primary identifier in the URL path.
For instance, when updating a user's profile, the user ID can be
 in the URL path and updated data in the request body.
*/

/*-----------------------------------------FINDBYIDANDDELETE-------------------------*/
/*
The findByIdAndDelete method in Mongoose returns the document that was
 deleted from the database.
 If no document matched the provided ID, it returns null
 */


 /*---------------------PAGINATION-----------------------*/
 /*
Pagination refers to the practice of dividing a large dataset into 
smaller,more manageable chunks or pages.
It is commonly used in applications where presenting a large amount of data all at once would be impractical 
or overwhelming, such as search results, product listings, or social media feeds.
Pagination typically involves specifying parameters such as the number of 
items per page and the current page number to retrieve a subset of data 
from the entire dataset.
Users can navigate through the pages to view different portions 
of the dataset.
*/

/*------------------limit page sort--------------------*/
/*
-------------------$skip:
Functionality: Allows skipping a specified number of documents in the pipeline.
Usage: Typically used for implementing pagination by skipping a certain number of documents to retrieve subsequent pages of results.
Example: { $skip: (pageNumber - 1) * pageSize } skips (pageNumber - 1) * pageSize documents.

-------------------------$limit:
Functionality: Limits the number of documents passed to the next stage in the pipeline.
Usage: Useful for restricting the number of results returned, especially when combined with $skip for pagination.
Example: { $limit: pageSize } limits the number of documents to pageSize.
--------------------------$sort:
Functionality: Sorts documents in the pipeline based on specified fields and sort orders.
Usage: Allows ordering the documents before passing them to the next stage.
Example: { $sort: { field1: 1, field2: -1 } } sorts documents by field1 in ascending order and field2 in descending order.*/