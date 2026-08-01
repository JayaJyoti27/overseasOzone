import { supabase } from "../config/supabase";
import { DatabaseError } from "../utils/AppError";

export async function uploadDocument(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string,
) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new DatabaseError(`Unable to upload document: ${error.message}`, error);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

/**
 * Pulls the object path back out of a Supabase "public" URL, e.g.
 * https://xyz.supabase.co/storage/v1/object/public/employer-documents/abc/1.jpg
 * -> "abc/1.jpg". Returns null if the URL doesn't match that shape.
 */
export function extractStoragePath(bucket: string, publicUrl: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);

  if (idx === -1) return null;

  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

/**
 * Returns a fresh, time-limited signed URL for a stored document. Works whether
 * the bucket is public or private, so it's the safe way to hand a document link
 * to the frontend instead of trusting a bucket's public-URL setting.
 */
export async function getSignedDocumentUrl(
  bucket: string,
  fileUrl: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const path = extractStoragePath(bucket, fileUrl);

  if (!path) return fileUrl;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return fileUrl;
  }

  return data.signedUrl;
}
