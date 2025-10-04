import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export const runtime = "nodejs"

// 🔧 Configure Cloudinary (make sure .env.local has these)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "expense_receipts", // optional folder name
          resource_type: "auto", // handles images, pdfs, etc.
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(buffer)
    })

    return NextResponse.json({
      url: (uploadResult as any).secure_url,
      public_id: (uploadResult as any).public_id,
    })
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error)
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    )
  }
}
