import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const video = await Video.findById(videoId)

    if(!video)
    {
        throw new ApiError(400,"video not found")
    }

    const findLikedVideo = await Like.find({video : videoId})
    console.log(findLikedVideo)
    let videoToggled;
    if(findLikedVideo?.length==0)
    {
        videoToggled = await Like.create({
        video : videoId,
        likedBy : video.owner
       })
    }
    else if(findLikedVideo?.length != 0)
    {
        videoToggled = await Like.findOneAndDelete({video : videoId})
    }
   console.log(videoToggled)
    return res
    .status(201)
    .json(
        new ApiResponse(201,videoToggled,"video toggled successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const comment = await Comment.findById(commentId)

    if(!comment)
    {
        throw new ApiError(400,"coment not found")
    }

    const findLikedComment = await Like.find({comment : commentId})
    let commentToggled;
    if(findLikedComment?.length == 0)
    {
        commentToggled = await Like.create({
        comment : commentId,
        likedBy : comment.owner
       })
    }
    else if(findLikedComment?.length != 0)
    {
        commentToggled = await Like.findOneAndDelete({comment : commentId})
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,commentToggled,"comment toggled successfully")
    )
    

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const tweet = await Tweet.findById(tweetId)

    if(!tweet)
    {
        throw new ApiError(400,"tweet not found")
    }

    const findLikedTweet = await Like.find({tweet : tweetId})
    let tweetToggled;
    if(findLikedTweet?.length == 0)
    {
        tweetToggled = await Like.create({
        tweet : tweetId,
        likedBy : tweet.owner
       })
    }
    else if(findLikedTweet?.length != 0)
    {
        tweetToggled = await Like.findOneAndDelete({tweet :tweetId})
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,tweetToggled,"tweet toggled successfully")
    )
    
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const allLikedVideos = await Like.find({likedBy : req.user._id,video: { $exists: true }});

    if(!allLikedVideos)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,allLikedVideos,"liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}