import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthCheck = asyncHandler(async (req, res) => {
    try {
        // Check database connectivity
        await mongoose.connection.db.admin().ping();

        // If the ping succeeds, respond with a 200 status
        res.json(new ApiResponse(200, { status: "OK", message: "Service is running and operational" }));
    } catch (error) {
        // If an error occurs, indicate that the service is not operational
        throw new ApiError(500, "Database connection failed on healthCheck");
    }
});//DONE!


export {
    healthCheck
    }
    