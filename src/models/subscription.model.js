import mongoose , {Schema}from "mongoose";

const subscriptionSchema = new Schema({
     subscriber:{
         type:Schema.Types.ObjectId, // those who will be subcribing
         ref:"User",
     },
     channel:{
        type:Schema.Types.ObjectId, // whose channel is subscribed by subscriber
        ref:"User",
     }
},
{
    timestamps: true
})


export const Subscription = mongoose.model("Subscription", subscriptionSchema);