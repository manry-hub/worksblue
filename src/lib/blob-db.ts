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
    const url = await getBlobUrl(filename);
    if (url) {
      const res = await fetch(`${url}?_t=${Date.now()}`);
      if (res.ok) {
        return await res.json();
      }
    }
    
    // Fallback to get if url not found or fetch fails
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

// Basic in-memory lock for the current Node/Edge instance
// This mitigates race conditions if multiple requests hit the same instance simultaneously.
const locks = new Map<string, Promise<void>>();

/**
 * Optimistically mutates the database. It queues operations per filename to ensure
 * read-modify-write cycles don't overlap within the same server instance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function mutateDB<T = any>(
  filename: string,
  updater: (data: T) => T | Promise<T>,
  seedData: T | null = null
): Promise<T> {
  // Wait for the previous lock on this file to release
  while (locks.has(filename)) {
    await locks.get(filename);
  }

  let releaseLock: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  locks.set(filename, lockPromise);

  try {
    const currentData = await readDB(filename, seedData);
    const updatedData = await updater(currentData);
    await writeDB(filename, updatedData);
    return updatedData;
  } finally {
    locks.delete(filename);
    releaseLock!();
  }
}
