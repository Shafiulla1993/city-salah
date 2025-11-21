// src/lib/middleware/parseForm.js

import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";
import { Readable } from "stream";

/**
 * parseForm(request)
 * - Parses multipart/form-data using formidable
 * - If JSON payload, returns fields as body and empty files
 * @param {Request} request Next.js request
 * @returns {Promise<{fields: object, files: object}>}
 */
export async function parseForm(request) {
  const contentType = request.headers.get("content-type") || "";

  // If multipart/form-data
  if (contentType.includes("multipart/form-data")) {
    const form = new IncomingForm({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10 MB
    });

    // Convert Next.js Request to Node.js Readable stream for formidable
    const buffer = await request.arrayBuffer();
    const nodeStream = Readable.from(Buffer.from(buffer));

    return new Promise((resolve, reject) => {
      form.parse(nodeStream, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
  }

  // Fallback: JSON body
  const body = await request.json().catch(() => ({}));
  return { fields: body, files: {} };
}

/**
 * saveUploadedFile(file, destFolder)
 * - Moves formidable temp file to destFolder and returns filename
 * @param {object} file formidable file object
 * @param {string} destFolder relative folder path (default: "uploads/masjids")
 * @returns {Promise<string|null>} filename
 */
export async function saveUploadedFile(file, destFolder = "uploads/masjids") {
  if (!file) return null;

  const tmpPath = file.filepath || file.file || file.path;
  if (!tmpPath) return null;

  const originalName =
    file.originalFilename || file.name || path.basename(tmpPath);
  const ext = path.extname(originalName);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

  const destDir = path.join(process.cwd(), destFolder);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const destPath = path.join(destDir, filename);
  await fs.promises.rename(tmpPath, destPath);

  return filename;
}

/**
 * deleteLocalFile(filename, destFolder)
 * - Deletes a file from the destFolder
 * @param {string} filename
 * @param {string} destFolder relative folder path (default: "uploads/masjids")
 */
export function deleteLocalFile(filename, destFolder = "uploads/masjids") {
  if (!filename) return;

  const fullPath = path.join(process.cwd(), destFolder, filename);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error("Failed to delete file:", fullPath, err);
    }
  }
}
