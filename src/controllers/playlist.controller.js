import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    const createPlaylist = await Playlist.create({
        name : name,
        description: description,
        owner : req.user,

    })

    if(!createPlaylist)
    {
        throw new ApiError(500,"something went wrong");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,createPlaylist,"playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    const user = await User.findById(userId);

    if(!user)
    {
        throw new ApiError(400,"user not found")
    }

    if(user._id.toString() !== req.user._id.toString())
    {
      throw new ApiError(400,"you are not authorized to see get the requested playlist")
    }

    const playlists = await Playlist.find({owner : userId})

    if(!playlists)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,playlists,"playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const playlistById = await Playlist.findById(playlistId);

    if(!playlistById)
    {
     new ApiError(400,"playlist not found")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,playlistById,"playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId)

    if(!playlist)
    {
        throw new ApiError(400,"playlist not found")
    }

    if(!video)
    {
        throw new ApiError(400,"video not found")
    }

    const videoAdded = await Playlist.updateOne(
        {_id : playlistId},
        {
            $push:{
                videos: videoId
            }
        }
    )

    if(!videoAdded)
    {
        throw new ApiError(500,"something went wrong")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(201,videoAdded,"video added successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId)

    if(!playlist)
    {
        throw new ApiError(400,"playlist not found")
    }

    if(!video)
    {
        throw new ApiError(400,"video not found")
    }

    const videoRemoved = await Playlist.updateOne(
        {_id : playlistId},
        {
            $pull:{
                videos: videoId
            }
        }
    )

    if(!videoRemoved)
    {
        throw new ApiError(500,"something went wrong")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(201,videoRemoved,"video removed successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const playlist = await Playlist.findById(playlistId);

    if(!playlist)
    {
        throw new ApiError(400,"no playlist available");
    }

    const ownerOfPlaylist = playlist.owner;

    if(!ownerOfPlaylist)
    {
        throw new ApiError(401,"you are not authorize to delete playlist")
    }

    if(ownerOfPlaylist.toString() !== req.user._id.toString())
    {
        throw new ApiError(401,"you are not authorize to delete playlist")
    }

    const playlistDeleted  = await Playlist.findOneAndDelete(playlistId);

    if(!playlistDeleted)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,playlistDeleted,"palylist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    const playlist = await Playlist.findById(playlistId);

    if(!playlist)
    {
        throw new ApiError(400,"no playlist available");
    }

    const ownerOfPlaylist = playlist.owner;

    if(!ownerOfPlaylist)
    {
        throw new ApiError(401,"you are not authorize to update playlist")
    }

    if(ownerOfPlaylist.toString() !== req.user._id.toString())
    {
        throw new ApiError(401,"you are not authorize to update playlist")
    }
    
    const playlistUpdated = await Playlist.findByIdAndUpdate(
        playlistId,
         {
             $set:{
                name : name,
                description : description
             }
         },
         {new: true}
     )
 
     if(!playlistUpdated)
     {
         throw new ApiError(500, "something went wrong")
     }
 
     return res
     .status(201)
     .json(
         new ApiResponse(201, playlistUpdated,"playlist updated successfully")
     )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
