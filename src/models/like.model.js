import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        comment:  // if we like a comment 
        {
            type:Schema.Types.ObjectId,
            ref:"Comment",
        },
        video: // if we like a video
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        tweet: // if we like a tweet
        {
            type:Schema.Types.ObjectId,
            ref:"Tweet"
        },
        likedBy: // who liked
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },{timestamps:true})

    export const Like = mongoose.model("Like", likeSchema);