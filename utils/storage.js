import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.js";
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    upload_preset: "car selling",
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const imageUploader = multer({ storage: imageStorage });

export { imageUploader };
