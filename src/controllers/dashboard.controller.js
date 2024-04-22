import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
   
   //finding number of videos added by channel
    const videos = await Video.aggregate([
       {
         $match:{
            owner : req.user._id
        }
       },
       {
        $group: {
            _id: null,
            count: { $sum: 1 } 
        }
       }
        
    ])

    const allSubscribers = await Subscription.aggregate([
        {
            $match:{
                channel : req.user._id
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 } 
            }
        }
     ])
    if(!videos)
    {
        throw new ApiError(400,"videos not available")
    }
    if(!allSubscribers)
    {
        throw new ApiError(400,"channel has no subscriber")
    }
  
     const videoCount = videos.length > 0 ? videos[0].count : 0;
     const subscriberCount = allSubscribers.length > 0 ? allSubscribers[0].count :0;
     
    return res
    .status(201)
    .json(
        new ApiResponse(201,`number of videos : ${videoCount} and number of subscribers : ${subscriberCount} fetched successfully`)
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find({owner : req.user._id});

    if(!videos)
    {
        throw new ApiError(400,"videos not available")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,videos,"videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }