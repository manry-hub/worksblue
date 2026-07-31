import { type NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
 
export async function GET(request: NextRequest) {
  // Auth is handled by Next.js edge middleware
 
  const pathname = request.nextUrl.searchParams.get('pathname');
  if (!pathname) {
    return NextResponse.json({ error: 'Missing pathname' }, { status: 400 });
  }
 
  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    });
   
    if (!result) {
      return new NextResponse('Not found', { status: 404 });
    }
   
    // Blob hasn't changed — tell the browser to use its cached copy
    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          'Cache-Control': 'private, no-cache',
        },
      });
    }
   
    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (err: unknown) {
    console.error("Private blob proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch private blob", details: (err as Error).message }, { status: 500 });
  }
}
