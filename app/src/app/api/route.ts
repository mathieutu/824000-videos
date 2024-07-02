import { NextResponse } from "next/server";
import { uploadToGoogleDrive } from "./upload_basic";

export async function POST(req: any, res: any) {
  console.log("entering post req w/", req.params);
  try {
    const formData = await req.formData();
    // Parse the URL to get query parameters
    const url = new URL(req.url);
    const folderId = url.searchParams.get("id");

    if (folderId === null) {
      // Handle the case where folderId is null. For example, return an error response.
      return NextResponse.json(
        { error: "Folder ID is required." },
        { status: 400 }
      );
    }

    console.log("here is folderID:", folderId);
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json(
        { error: "No files received." },
        { status: 400 }
      );
    }

    const filename = file.name.split(" ").join("_");

    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToGoogleDrive(buffer, filename, folderId);

    return NextResponse.json({ message: "Fichier(s) importé(s) avec succès" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
