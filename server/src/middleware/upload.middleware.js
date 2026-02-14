import multer from "multer";
import { storage } from "../config/cloudinary.js";

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit for cloud uploads
});

export default upload;
