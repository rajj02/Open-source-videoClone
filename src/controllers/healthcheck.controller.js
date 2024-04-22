import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    const {healthStatus} = req.body;

    if(!healthStatus)
    {
        throw ApiError(404,"health status not available")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,healthStatus,"health status fetched successfully")
    )
})

export {
    healthcheck
    }
    