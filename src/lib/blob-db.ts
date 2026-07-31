import { put, list, del, get } from '@vercel/blob';

// In-memory cache to reduce list() calls for repeated operations.
// Keys are the filename (e.g., 'projects.json'), values are the blob URL.
const blobUrlCache = new Map<string, string>();

/**
 * Ensures the BLOB_READ_WRITE_TOKEN is available.
 */
function checkToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN is not set in environment variables. Vercel Blob operations may fail if not running on Vercel with token injected.");
  }
}

/**
 * Finds the exact URL for a given blob filename by listing the blobs.
 * Uses a simple cache to avoid excessive list() API calls.
 */
async function getBlobUrl(filename: string): Promise<string | null> {
  if (blobUrlCache.has(filename)) {
    return blobUrlCache.get(filename)!;
  }
  
  checkToken();
  try {
    const { blobs } = await list({ prefix: filename, limit: 100 });
    // Find exact match (since prefix could match 'filename123')
    const blob = blobs.find(b => b.pathname === filename);
    if (blob) {
      blobUrlCache.set(filename, blob.url);
      return blob.url;
    }
  } catch (err) {
    console.error(`Error listing blobs for prefix ${filename}:`, err);
  }
  return null;
}

/**
 * Reads a JSON file from Vercel Blob.
 * If it doesn't exist, and seedData is provided, it writes seedData and returns it.
 * If it doesn't exist and no seedData is provided, it returns an empty array.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readDB(filename: string, seedData: any = null): Promise<any> {
  checkToken();
  try {
    const result = await get(filename, { access: 'private', useCache: false });
    if (result && result.stream) {
      return await new Response(result.stream).json();
    }
  } catch (err) {
    console.error(`Error fetching blob data for ${filename}:`, err);
  }
  
  // File not found or failed to fetch
  if (seedData) {
    await writeDB(filename, seedData);
    return seedData;
  }
  
  return [];
}

/**
 * Writes data to Vercel Blob as a JSON file.
 * We use addRandomSuffix: false to ensure we overwrite the exact pathname.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function writeDB(filename: string, data: any): Promise<void> {
  checkToken();
  try {
    const blob = await put(filename, JSON.stringify(data, null, 2), { 
      access: 'private', 
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });
    // Update cache with the new/existing URL
    blobUrlCache.set(filename, blob.url);
  } catch (err) {
    console.error(`Error writing blob ${filename}:`, err);
    throw err; // Re-throw to be handled by API route
  }
}

/**
 * Deletes a file from Vercel Blob.
 */
export async function deleteDB(filename: string): Promise<void> {
  const url = await getBlobUrl(filename);
  if (url) {
    checkToken();
    try {
      await del(url);
      blobUrlCache.delete(filename);
    } catch (err) {
      console.error(`Error deleting blob ${url}:`, err);
    }
  }
}
