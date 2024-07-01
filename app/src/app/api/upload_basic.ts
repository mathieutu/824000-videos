/**
 * Insert new file.
 * @return{obj} file Id
 * */
async function uploadBasic() {
  const fs = require("fs");
  const { GoogleAuth } = require("google-auth-library");
  const { google } = require("googleapis");

  // Get credentials and build service
  // TODO (developer) - Use appropriate auth mechanism for your app
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/drive",
  });
  const service = google.drive({ version: "v3", auth });
  const requestBody = {
    name: "photo.jpg",
    fields: "id",
  };
  const media = {
    mimeType: "image/jpeg",
    body: fs.createReadStream("files/photo.jpg"),
  };
  try {
    const file = await service.files.create({
      requestBody,
      media: media,
    });
    console.log("File Id:", file.data.id);
    return file.data.id;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}
