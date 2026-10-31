import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with user credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "vujf5uxx",
  api_key: process.env.CLOUDINARY_API_KEY || "469726283299424",
  api_secret: process.env.CLOUDINARY_API_SECRET || "wvMsZ8SEf9U0dRW8R1nIM3mDDto",
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64 data URI for Cloudinary uploader
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || "image/jpeg";
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary under the moyan_learn folder
    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder: "moyan_learn",
      resource_type: "auto",
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      format: uploadResponse.format,
    });
  } catch (error: any) {
    console.error("Cloudinary upload API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}
