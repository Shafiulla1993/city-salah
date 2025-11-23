// src/lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadFileToCloudinary(localFilePath, folder = "") {
  try {
    const opts = {};
    if (folder) opts.folder = folder;
    const result = await cloudinary.uploader.upload(localFilePath, {
      ...opts,
      resource_type: "image",
    });
    return result; // contains secure_url, public_id, etc.
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}

export default cloudinary;
