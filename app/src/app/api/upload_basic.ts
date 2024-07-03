import { google } from "googleapis";
import * as stream from "stream";

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

export async function uploadToGoogleDrive(
  buffer: any,
  filename: string,
  folderId: string
) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const { data } = await drive.files.create({
    media: {
      mimeType: "application/octet-stream", // Change this according to the file type
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