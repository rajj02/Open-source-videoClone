import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const allVideos = await Video.find({});

    if(!allVideos)
    {
        throw new ApiError(500,"something went wrong while fetching videos");
    }

    return res
    .status(201)
    .json(
        new ApiResponse (201,allVideos,"videos sent successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration} = req.body
    // TODO: get video, upload to cloudinary, create video
     
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath =  req.files?.thumbnail[0]?.path;
    if(!(videoLocalPath && thumbnailLocalPath))
    {
        throw new ApiError(400, "please send the video and thumbnail both");
    }


    const videoUploaded = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoUploaded)
    {
        throw new ApiError(400,"video file is required");
    }
   console.log(req.user);
    const video = await Video.create({

        videoFile : videoUploaded.url,
        thumbnail : thumbnailUploaded.url,
        title : title,
        description : description,
        duration : duration,
        // views:0,
        // isPublished:true,
        owner : req.user


    })
    
    const videoCreated = await Video.findById(video._id);

    if(!videoCreated)
    {
        throw new ApiError(500,"something went wrong while creating the video in DB");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, videoCreated,"video created successfully")
    )




})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const videoById = await Video.findById(videoId)

    if(!videoById)
    {
        throw new ApiError(500,"video not found");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,videoById,"video sent successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description, duration} = req.body;
    const thumbnailLocalPath =  req.file?.path;

    console.log(req.file);

    if(!(thumbnailLocalPath))
    {
        throw new ApiError(400, "please send the updated thumbnail");
    }
    const video = await Video.findById(videoId);

    if(!video)
    {
        throw new ApiError(500,"video not found");
    }
    
    const user =await  video?.owner;

    if(!user)
    {
      throw new ApiError(501, "video owner not available, you are not allowed to update video")
    }

    if(user.toString() !== req.user._id.toString())
    {
        throw new ApiError(400, "you are not the owner of the video, not allowed to update the video")
    }
     
    const thumbnailUpdated  = await uploadOnCloudinary(thumbnailLocalPath);
    
    if(!thumbnailUpdated)
    {
        throw new ApiError(400,"updated thumbnail is required");
    }
    const videoUpdated  = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                thumbnail : thumbnailUpdated.url,
                title : title,
                description : description,
                duration : duration,
               
            }
        },
        {new : true});

    if(!videoUpdated)
    {
        throw new ApiError(500,"something went wrong");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,videoUpdated, "video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

   
    const video = await Video.findById(videoId);

    if(!video)
    {
        throw new ApiError(500,"video not found");
    }
    
    const user =await  video?.owner;

    if(!user)
    {
      throw new ApiError(501, "video owner not available, you are not allowed to delete video")
    }

    if(user.toString() !== req.user._id.toString())
    {
        throw new ApiError(400, "you are not the owner of the video, not allowed to delete the video")
    }

    const videoDeleted  = await Video.findOneAndDelete(videoId);

    if(!videoDeleted)
    {
        throw new ApiError(500,"something went wrong");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,videoDeleted, "video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    const video = await Video.findById(videoId);

    if(!video)
    {
        throw new ApiError(500,"video not found");
    }
    
    const user =await  video?.owner;

    if(!user)
    {
      throw new ApiError(501, "video owner not available, you are not allowed to delete video")
    }

    if(user.toString() !== req.user._id.toString())
    {
        throw new ApiError(400, "you are not the owner of the video, not allowed to delete the video")
    }
 
    let toggledState =( await Video.findById(videoId))?.isPublished

    

    toggledState = !toggledState;

    console.log(toggledState);

    const setStatus = await Video.findByIdAndUpdate(
            videoId,
            {
                $set:{
                    isPublished: toggledState
                }
            },
            {new : true}
        )
   
    if(!setStatus)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, setStatus,"status updated successfully")
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
