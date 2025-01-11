import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from './cloudinary.js';
// Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const imageUploader = multer({ storage: imageStorage });


export { imageUploader };
