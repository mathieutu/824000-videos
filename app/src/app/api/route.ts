import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { uploadToGoogleDrive } from "./upload_basic";

export async function POST(req: any, res: any) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json(
        { error: "No files received." },
        { status: 400 }
      );
    }

    const filename = file.name.replaceAll(" ", "_");

    const buffer = Buffer.from(await file.arrayBuffer());

    uploadToGoogleDrive(buffer, filename);

    // await writeFile(
    //   path.join(process.cwd(), "/public/assets/" + filename),
    //   buffer
    // );

    return NextResponse.json({ Message: "Success" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
