import { google } from "googleapis";
import * as stream from "stream";
import * as fs from "fs";
import * as path from "path";

// Initialize the Google Drive API client
const googleCredentials = process.env.GOOGLE_CREDENTIALS;
if (!googleCredentials) {
  throw new Error("Google credentials not found.");
}

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(googleCredentials),
  scopes: ["https://www.googleapis.com/auth/drive"], // Specify the scope of the API you're accessing
});

const drive = google.drive({ version: "v3", auth });

// Function to determine MIME type based on file extension
function getMimeType(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    // Add more MIME types as needed
  };
  return mimeTypes[extension] || "application/octet-stream";
}

export async function uploadToGoogleDrive(
  buffer: Buffer,
  filename: string,
  folderId: string
) {
  const mimeType = getMimeType(filename);
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const data = await drive.files.create({
    media: {
      mimeType,
      body: bufferStream,
    },
    requestBody: {
      name: filename,
      parents: [folderId], // Optional: specify a folder ID if you want to upload to a specific folder
    },
    fields: "id",
  });

  return data;
}

export async function listFolders() {
  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder'",
    fields: "files(id, name)",
  });

  return res.data.files;
}
