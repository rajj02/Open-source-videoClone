import mongoose, { Mongoose } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId);

    if(!video)
    {
        throw new ApiError(500,"video not found");
    }

    const comments = await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "allComments",
                pipeline:[
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "commentOwner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                               
                            ]
                        }
                    },
                    {
                        $addFields:{
                            commentOwner:{
                                $first: "$commentOwner"
                            }
                        }
                    },
                    {
                        $project:{
                           content:1,
                           commentOwner:1
                        }
                    }
                    
                ]
            }
        },
        {
            $project:{
                allComments:1
            }
        }
        
    ])

    if(!comments)
    {
      throw new ApiError(404,"No comments available");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,comments[0],"comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;

    const video = await Video.findById(videoId);

    
    if(!content)
    {
        throw new ApiError(400, "please provide content of the comment");
    }
    
    if(!video)
    {
       throw new ApiError(500,"video not found");
    }

    const comment = await Comment.create({
        content:content,
        video :video,
        owner: req.user
    })

    if(!comment)
    {
        throw new ApiError(500,"something went wrong");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,comment,"comment posted successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const {commentId} = req.params

    const comment = await Comment.findById(commentId);

    if(!comment)
    {
        throw new ApiError(400,"no comment available");
    }

    const ownerOfComment = comment.owner;

    if(!ownerOfComment)
    {
        throw new ApiError(401,"you are not authorize to delete comment")
    }

    if(ownerOfComment.toString() !== req.user._id.toString())
    {
        throw new ApiError(401,"you are not authorize to delete comment")
    }

    const commentUpdated = await Comment.findByIdAndUpdate(
       commentId,
        {
            $set:{
                content: content
            }
        },
        {new: true}
    )

    if(!commentUpdated)
    {
        throw new ApiError(500, "something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, commentUpdated,"comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const comment = await Comment.findById(commentId);

    if(!comment)
    {
        throw new ApiError(400,"no comment available");
    }

    const ownerOfComment = comment.owner;

    if(!ownerOfComment)
    {
        throw new ApiError(401,"you are not authorize to delete comment")
    }

    if(ownerOfComment.toString() !== req.user._id.toString())
    {
        throw new ApiError(401,"you are not authorize to delete comment")
    }

    const deleteComment = await Comment.findOneAndDelete(commentId);

    if(!deleteComment)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,deleteComment,"comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
