import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


//------------------createPlaylist----------------

const createPlaylist = asyncHandler(async (req, res) => {
    const {playlistName, description} = req.body

    //TODO: create playlist
    if (!playlistName) {
        throw new ApiError(404, "Name of playlist is required")
    }

    try {
        console.log(playlistName)
        const newPlaylist = await Playlist.create(
            {
                playlist: playlistName,
                description: description || "Playlist Description",
                videos: [],
                owner:req.user._id
            },
            {new: true, validateBeforeSave: false}
            )

        if (!newPlaylist) {
            throw new ApiError(404, "Could not create playlist with info:")
        }

        console.log("2")
        res
        .status(201)
        .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"))
    } catch (error) {
        throw new ApiError(500, error, "An error while creating playlist : try again later")
    }

})//DONE!


//-----------------------GetuserPlaylist--------------------

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid user id provided for user playlist")
    }

    try {
        const userPlaylists = await Playlist.find({owner:userId})
        console.log(userPlaylists,"userPlaylists")
        if (!userPlaylists || userPlaylists.length === 0) {
            throw new ApiError(404, `No playlists exist for user ${userId}`)
        }

        res
       .status(200)
        .json(new ApiResponse(200, userPlaylists, "User playlists fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error, "An error while fetching user playlists : try again later")
    }
})//DONE!


//--------------------getPlaylistByID--------------------

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Inavalid playlist id is provided : enter valid id to get playlist")
    }

    try {
        const playlist = await Playlist.findById(playlistId)
        console.log(playlist, "playlist by id")

        if (!playlist) {
            throw new ApiError(404, "No playlist found")
        }

        res
        .status(200)
        .josn(new ApiResponse(200, playlist, "Playlist has been fetched successfully"))

    } catch (error) {
        throw new ApiError(500, error, "An error while getting playlist by id : try again later")
    }
})//Done!


//--------------------addvideotoplaylist--------------------

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!(isValidObjectId(playlistId) || isValidObjectId(videoId))) {
        throw new ApiError(404, "Enter valid playlistId and videoId to add video in playlist")
    }

    try {
        const videoAddedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { 
                $push: { 
                    videos: videoId 
                }
             }, // Using $push to add videoId to the videos array
            {
                 new: true,
                 validateBeforeSave: false 
            }
        );
        

        console.log(videoAddedPlaylist, "videoAddedPlaylist")

        if (!videoAddedPlaylist || videoAddedPlaylist.length === 0) {
            throw new ApiError(404, "No videos to add in playlist")
        }

        res
        .status(200)
        .json(new ApiResponse(200, videoAddedPlaylist, "video added to playlist successfully"))
    } catch (error) {
        throw new ApiError(500, error, "An error occured while adding video in playlist: please try again later")
    }
})//DONE!


//-----------------removeVideoFromPlaylist--------------------

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!(playlistId || videoId)) {
        throw new ApiError(404, "Invalid video or playlist id : Enter valid ids")
    }

    try {
        const playlistWithoutVideo = await Playlist.findOne({_id: playlistId, videos:videoId})
        
        if (!playlistWithoutVideo) {
            throw new ApiError(404, "Video does not exist in playlist or playlist was not created")
        }

        console.log(playlistWithoutVideo, "playlistWithoutVideo1")
         // Remove video from the playlist
         const indexOfVideoToBeRemoved = playlistWithoutVideo.videos.indexOf(videoId);
         /*
         The indexOf() function is a built-in JavaScript method used to
          find the index of the first occurrence of a specified value
           within an array.
         */

         if (indexOfVideoToBeRemoved > -1) {
             playlistWithoutVideo.videos.splice(indexOfVideoToBeRemoved, 1);
         }
 
         console.log(playlistWithoutVideo, "playlistWithoutVideo2")
         // Save the modified playlist
         await playlistWithoutVideo.save();

         console.log(playlistWithoutVideo, "3")
        res
        .status(200)
        .json(new ApiResponse(200, playlistWithoutVideo, "Video is removed from playlist"))
    } catch (error) {
        throw new ApiError(500, error, "An error occured while removing video from playlist")
    }

})//DONE!


//----------------------deletePlaylist-------------------------

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlistId to delete playlist") 
    }

    try {
        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

        console.log(deletedPlaylist, "playlist to be deleted")
        if (!deletedPlaylist) {
            throw new ApiError(404, "Playlist not found to delete");
        }        
        console.log(deletedPlaylist, "deletedPlaylist2")
        res
        .status(200)
        .json(new ApiResponse(200, deletePlaylist, "Playlist deleted successfully"))

    } catch (error) {
        throw new ApiError(500, error, "An error occurred while deleting playlist")
    }
})//DONE!


//--------------------updatePlaylist----------------------------

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {playlistName, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlistId: Please provide a valid playlistId");
    }

    if (!playlistName) {
        throw new ApiError(404, "Name is required to update the playlist");
    }

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
           playlistId,
            {
                playlist:playlistName,
                description:description
            },
            {new: true, validateBeforeSave: false},
        )
        
        console.log(updatedPlaylist, "Playlist to be updated")

        if (!updatedPlaylist) {
            throw new ApiError(404, "Could not fund Playlist to update")
        }
        
        console.log(updatedPlaylist, "updated Playlist")

        res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated"))
    } catch (error) {
        throw new ApiError(500, 'An error occurred while trying to update the playlist')
    }
})//DONE!


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}