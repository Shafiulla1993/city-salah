// src/lib/helpers/upload.js

import { adminAPI } from "@/lib/api/sAdmin";

/**
 * Upload masjid image
 * @param {File} file
 * @returns { imageUrl, imagePublicId }
 */
export async function uploadMasjidImage(file) {
  if (!file) return null;

  const fd = new FormData();
  fd.append("image", file);

  const res = await adminAPI.uploadMasjidImage(fd);

  if (!res?.success) {
    throw new Error(res?.message || "Image upload failed");
  }

  return {
    imageUrl: res.data.imageUrl,
    imagePublicId: res.data.imagePublicId,
  };
}

/**
 * Delete masjid image
 */
export async function deleteMasjidImage(publicId) {
  if (!publicId) return;

  await adminAPI.deleteMasjidImage({ publicId });
}
