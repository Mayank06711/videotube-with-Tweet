import {v2 as cloudinary} from "cloudinary"
import fs from "fs"  // node js file system library no need to install

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null; // no cloudinary upload as not a correct  local file path is found 
         // upload file on cloudinary 
        const response = await cloudinary.uploader.upload
        (localFilePath, {
            resource_type:"auto"
        });
        // file is uploaded on cloudinary 
         console.log("file is uploaded on cloudinary : ", response.url);
         return response;
    } catch (error) {
        console.log("upload error I`m from cloudinaryfileUpload  : also see where i have been used ", error)
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as upload operation got failed
        return null;
    }
}


export {uploadOnCloudinary}