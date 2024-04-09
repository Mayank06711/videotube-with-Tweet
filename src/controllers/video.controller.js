import mongoose, {isValidObjectId} from "mongoose"
import {v2 as cloudinary} from "cloudinary"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Comment} from "../models/comment.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteOnCloudinaryVideo} from "../utils/cloudinary.fileupload.js"

//  TODO: While deleting I am not deleting video/files from the cloudinary
/*--------------------GET ALL VIDEOS---------------- */


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, user_Id } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (!(query || isValidObjectId(user_Id))) {
        throw new ApiError(400, "Required field: query or userId")
    }
    console.log(query, sortType, sortBy, user_Id,"query, sortType, sortBy, sortBy")
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
                { owner:new mongoose.Types.ObjectId(user_Id) }
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
                   commentsOnVideo : "$commentsOnVideo"
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
                
                    [sortBy]: sortType === "desc" ? -1 : 1 ,
                     createdAt: -1  // Sort by createdAt in descending order as an option newest first
                  
          } //sort by ascending (1) or descending (-1)order
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
})//Done loading videos from database


/*------------------Publish Video------------------ */

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!(title || description )) {
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
}) //DONE when use postman always upload files again again else undefined error come


/*-----------------GETVIDEOBYID----------------- */

const getVideoById = asyncHandler(async (req, res) => {
    const { video_Id } = req.params    // destructuring should be same as in defined route name
    //TODO: get video by id
    if (!video_Id) {
        throw new ApiError(400, "Please enter valid videoId")
    }
    const user = await User.findById(req.user._id)

    const video = await Video.findById(video_Id);
    
    console.log(video, "getvideoById")
     // {
        //     $inc:{view:1},
        // },
        // {new:true}
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
   
    if(video.isPublished === false && video.owner.toString()!== user._id.toString()){
        throw new ApiError(403, "Video is not published")
    }
    
    const updateVideo = await Video.updateOne(
        {_id: video_Id},
        {$inc: {view :1}},
        {new:true , validateBeforeSave:false}
    )
    
    if (updateVideo.nModified === 0) {
        throw new ApiError(404, "Video not Found")
    }

    res
    .status(200)
    .json(new ApiResponse(200, video, "Your required video"))
}) // DONE , ENTER VIDEOID IN POSTMAN URL OR WHEREEVER YOU ARE USING IT


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
        {new:true, validateBeforeSave:false},
    )

    console.log(video, "video updated")
    if (!video) {
         throw new ApiError(404, "Video can not be updated")
    }
    res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successully"))
})//DONE , ENTER VALID VIDEOID AND ADD FORM DATA 


/*------------------DELETE---------------------*/

const deleteVideo = asyncHandler(async (req, res) => {
    const { video_Id } = req.params
    //TODO: delete video
    if (!isValidObjectId(video_Id) && !video_Id?.trim()) {
        throw new ApiError(404, "enter valid video id to know delete video") 
    }

    // Delete the video from Cloudinary
    try {
        const video = await Video.findById(video_Id)

        if (!video) {
            throw new ApiError(404, "Video not found");
        }
        

      //METHOD-1  To delete video from Cloudinary we need to pass path as name of the video that we want to delete
        
        const videoUrl = video.videoFile  // extract video url from video document

        const urlArrayOfVideo = videoUrl.split("/") // split url into array from every / point

        const videoFromUrl = urlArrayOfVideo[urlArrayOfVideo.length - 1] // extracting video name with format

        const videoName = videoFromUrl.split(".")[0]   // .mp4 or .png etc should be removed to get name of url
        
        // for thumbnail 
        
        const thumbnailUrl = video.thumbnail  // extract video url from video document

        const urlArrayOfThumbnail = thumbnailUrl.split("/") // split url into array from every / point

        const thumbnailFromUrl = urlArrayOfThumbnail[urlArrayOfThumbnail.length - 1] // extracting video name with format 

        const thumbnailName = thumbnailFromUrl.split(".")[0] // only name of thumbnail without any format
    
        //deleting video document from database first then  from cloudinary

        if (video.owner.toString() === req.user._id.toString()) {

        const deleteResultFromDatabase = await Video.findByIdAndDelete(video_Id)
         // console.log(deleteResultFromDatabase, "video")
        if (!deleteResultFromDatabase) {
            throw new ApiError(404, "Video is already deleted from database")
        }

        await deleteOnCloudinaryVideo(videoName); // Delete video file

        await cloudinary.uploader.destroy(thumbnailName,
            {
                invalidate: true,
               // resource_type:"image"
            },
              (error,result) => {
            console.log("result:", result, ", error:", error, "result or error after deleting thumbnail from cloudinary")
            }
        ); // Delete thumbnail

        const comments = await Comment.find({ video: deleteResultFromDatabase._id});

        const commentsIds = comments.map((comment) => comment._id); // taking out the commentId
        
        await Like.deleteMany({video: deleteResultFromDatabase._id});
        await Like.deleteMany({comment: { $in: commentsIds }}); // deleting all comments of the video
        await Comment.deleteMany({video: deleteResultFromDatabase._id});
    }else {
        throw new ApiError(403, "You are not authorized to delete this video")
    }
        res
        .status(200)
        .json(new ApiResponse(200, video, "Video deleted from database"))
    } catch (error) {
        throw new ApiError(500, error, "Failed to delete video:Try again later");
    }
}) // DONE ENTER VIDEO_ID DIECTLY IN POSTMAN URL


/*----------------TOGGLEPUBLISHSTATUS----------------*/

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { video_Id } = req.params
    console.log(video_Id, "video id")
    if (!video_Id) {
        throw new ApiError(404, "enter valid video id to know publish status") 
    }
    const video = await Video.findById(video_Id)
    console.log(video, "video")

    if (!video) {
        throw new ApiError(400, "Can not toggle publish status , Either video does no texist or already deleted")
    }

    video.isPublished = !video.isPublished
    await  video.save({ validateBeforeSave: false })

    res
    .status(200)
    .json(new ApiResponse(200, video_Id, "Video status is toggled successfully"))
}) // DONE if ispublished is true video will be shown in othersise not

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
Example: { $sort: { field1: 1, field2: -1 } } sorts documents by field1 in ascending order and field2 in descending order.
-*/

/*-------------------------DELETING FILES FROM CLOUDINARY ----------------
STEPS TO FOLLOW
1> the method which cloudinary suggest to delete files from cloudinary using nodeJs is destroy [cloudinary.v2.uploader.destroy(public_id, options).then(callback);] for nodeJs
destroy takes three arguments which are PUBLIC_ID, options and callback
PUBLIC_ID: this is not the url that you get from cloudinary server, this requires name of file (which is given by either u or cloudinary itself) which is to be extracted as above 
Options:type of files to be deleted from cloudinary, default is image but for other u need to define resource_type of files like video raw etc
callback: function to be called after success or failure of delete operation on cloudinary which return a reuslt as promise with status code 
*/