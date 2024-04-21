import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const channel = await Subscription.find({channel : channelId})

    if(!channel)
    {
        throw new ApiError(400,"channel not found")
    }

    const findSubscriber = await Subscription.find({subscriber : req.user._id,channel : channelId});
    console.log(findSubscriber)

    let toggleSubscriber;
    if(findSubscriber?.length ==0)
    {
      toggleSubscriber = await Subscription.create({
        subscriber : req.user._id,
        channel : channelId
      })
    }

    else if(findSubscriber?.length !=0)
    {
        toggleSubscriber = await Subscription.findOneAndDelete({subscriber : req.user._id,channel : channelId})
    }

    if(!toggleSubscriber)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,toggleSubscriber,"subscription toggled successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const channel = await User.findById(channelId);

    if(!channel)
    {
        throw new ApiError(400,"channel does not exist");
    }

    const getSubscribers = await Subscription.find({channel : channelId});

    if(!getSubscribers)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,getSubscribers,"subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscriber = await User.findById(subscriberId);

    if(!subscriber)
    {
        throw new ApiError(400,"subscriber does not exist");
    }

    const getChannels = await Subscription.find({subscriber : subscriberId});

    if(!getChannels)
    {
        throw new ApiError(500,"something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,getChannels,"Channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}