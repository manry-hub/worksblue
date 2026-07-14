import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET(request: Request, context: { params: Promise<{ filename: string }> }) {
  try {
    const params = await context.params;
    const filename = params.filename;
    
    let filePath = path.join(process.cwd(), ".worksblue", "uploads", filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (!fs.existsSync(filePath)) {
        return new NextResponse("File not found", { status: 404 });
      }
    }

    const file = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = "application/octet-stream";
    if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".svg") contentType = "image/svg+xml";
    
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (e) {
    console.error("Error serving file:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
