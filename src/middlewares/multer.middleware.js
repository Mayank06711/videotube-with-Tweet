

import multer from "multer";
// Multer is a node.js middleware for handling multipart/form-data, 
// which is primarily used for uploading files ,this middlewere givess access to files/file in request  
// ----------------------------------------------------------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // cb means callback on docs
  },
});

export const upload = multer({
  storage: storage
});
