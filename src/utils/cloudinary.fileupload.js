
 import {v2 as cloudinary} from "cloudinary"
 import fs from "fs"  // node js file system library no need to install

          
 cloudinary.config ({ 
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
   api_key: process.env.CLOUDINARY_API_KEY, 
   api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null; // no cloudinary upload as not a correct  local file path is found 
         
        // upload file on cloudinary 

        const response = await cloudinary.uploader.upload
         (  localFilePath, {
              resource_type:"auto"
         }
         );

        // file is uploaded on cloudinary
        
         fs.unlinkSync(localFilePath);
        // console.log("file is uploaded on cloudinary  : ", response.url);
         return response;

    } catch (error) {

        console.log("upload error I`m from cloudinaryfileUpload  : also see where i have been used ", error)

        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as upload operation got failed
       
        return null;
    }
}//Upload file on cloudinary


 const deleteOnCloudinaryVideo = async (oldFilePublicId) => {
  try {
    if(!oldFilePublicId) return null;
    // delete the file on cloudinary.
    const public_id = oldFilePublicId.split("/").pop().split(".")[0]
    const response = await cloudinary.uploader.destroy(public_id, { invalidate: true, resource_type: 'video'});
    console.log("File deleted on cloudinary", oldFilePublicId, "public_id", public_id);
    return response;
  } 
  catch (error) {
    return error;
  }
};

const deleteOnCloudinaryImage = async (oldFilePublicId) => {
  try {
    if(!oldFilePublicId) return null;
    // delete the file on cloudinary.
    const public_id = oldFilePublicId.split("/").pop().split(".")[0]
    const response = await cloudinary.uploader.destroy(public_id, { invalidate: true, resource_type: 'raw'});
    console.log("File deleted on cloudinary", oldFilePublicId, "public_id", public_id);
    return response;
  } 
  catch (error) {
    return error;
  }
};

// for image resource-type raw
export {uploadOnCloudinary, deleteOnCloudinaryVideo, deleteOnCloudinaryImage}