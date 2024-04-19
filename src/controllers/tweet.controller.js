import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;

    if(!content)
    {
        throw new ApiError(400,"please provide the content of the tweet");
    }

    const tweetCreated = await Tweet.create({
        content:content,
        owner:req.user
    })

    if(!tweetCreated)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,tweetCreated,"tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    if(!userId)
    {
        throw new ApiError(400,"please provide the userId");
    }

    // const tweets = await Tweet.aggregate(
    //    [
    //     {
    //         $match:{
    //         owner : new mongoose.Types.ObjectId(userId)
    //         }
    //     },
    //     {
    //         $lookup:{
    //           from:"users",
    //           localField:"owner",
    //           foreignField:"_id",
    //           as:"ownerOfTweets"
    //         }
    //     }
    //    ]
    // )
    
    const tweets = await Tweet.find({owner : userId})

    if(!tweets)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,tweets,"tweets fetched succesfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;

    const tweet = await Tweet.findById(tweetId);

    if(!tweet)
    {
        throw new ApiError(400,"no tweet available");
    }

    const ownerOfTweet = tweet.owner;

    if(!ownerOfTweet)
    {
        throw new ApiError(401,"you are not authorize to delete tweet")
    }

    if(ownerOfTweet.toString() !== req.user._id.toString())
    {
        throw new ApiError(401,"you are not authorize to delete tweet")
    }

    const tweetUpdated = await Tweet.findByIdAndUpdate(
        tweetId,
         {
             $set:{
                 content: content
             }
         },
         {new: true}
     )
 
     if(!tweetUpdated)
     {
         throw new ApiError(500, "something went wrong")
     }
 
     return res
     .status(201)
     .json(
         new ApiResponse(201, tweetUpdated,"comment updated successfully")
     )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;

    const tweet = await Tweet.findById(tweetId);

    if(!tweet)
    {
        throw new ApiError(400,"no tweet available");
    }

    const ownerOfTweet = tweet.owner;

    if(!ownerOfTweet)
    {
        throw new ApiError(401,"you are not authorize to delete tweet")
    }

    if(ownerOfTweet.toString() !== req.user._id.toString())
    {
        throw new ApiError(401,"you are not authorize to delete tweet")
    }

    const tweetDeleted = await Tweet.findOneAndDelete(tweetId);

    if(!tweetDeleted)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,tweetDeleted,"tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
