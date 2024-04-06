import mongoose ,{Schema} from "mongoose";

const playlistSchema = new Schema (
    {
        playlist:
        {
            type:String,
            required:[true,"default playlist"],
        },
        description:
        {
            type:String,
            required:[true,"Playlist Description"]
        },
        videos:[
            {
             type:Schema.Types.ObjectId,
             ref:"Video"
            }
         ],
         owner:
         {
             type:Schema.Types.ObjectId,
             ref:"User"
         }
    },{timestamps:true})


export const Playlist = mongoose.model("Playlist",playlistSchema)