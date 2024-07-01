import { google } from "googleapis";
import * as stream from "stream";

// Initialize the Google Drive API client
const auth = new google.auth.GoogleAuth({
  keyFile: "service_account.json", // Path to your service account credentials file
  scopes: ["https://www.googleapis.com/auth/drive"], // Specify the scope of the API you're accessing
});

const drive = google.drive({ version: "v3", auth });

export async function uploadToGoogleDrive(buffer: any, filename: string) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const { data } = await drive.files.create({
    media: {
      mimeType: "application/octet-stream", // Change this according to the file type
      body: bufferStream,
    },
    requestBody: {
      name: filename,
      parents: ["1MWxRUZ9O7aE7Q29KdWvS9If5al3ah3o0"], // Optional: specify a folder ID if you want to upload to a specific folder
    },
    fields: "id",
  });

  return data;
}
