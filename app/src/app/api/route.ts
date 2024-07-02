import { NextResponse } from "next/server";
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

    const filename = file.name.split(" ").join("_");

    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToGoogleDrive(buffer, filename);

    return NextResponse.json({ message: "Success" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
