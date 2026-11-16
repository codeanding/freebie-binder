import "server-only";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { AWS_REGION } from "./aws";

const UPLOADS = process.env.UPLOADS_BUCKET!; // private: the browser uploads here
const IMAGES = process.env.IMAGES_BUCKET!; // public: only the server writes here
const s3 = new S3Client({ region: AWS_REGION });

export const MAX_IMAGE_BYTES = 2_000_000;
const UPLOAD_URL_SECONDS = 120;

/** Signed POST: S3 rejects files over 2 MB or that don't declare image/jpeg. */
export function uploadForm(id: string) {
  return createPresignedPost(s3, {
    Bucket: UPLOADS,
    Key: id,
    Conditions: [
      ["content-length-range", 1, MAX_IMAGE_BYTES],
      ["eq", "$Content-Type", "image/jpeg"],
    ],
    Fields: { "Content-Type": "image/jpeg" },
    Expires: UPLOAD_URL_SECONDS,
  });
}

/** JPEG files start with the bytes FF D8 FF. */
export const isJpeg = (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

/** Reads the upload and checks it really is a JPEG (not just that it says so). */
export async function readUpload(id: string): Promise<Uint8Array | null> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: UPLOADS, Key: id }));
    if ((res.ContentLength ?? 0) > MAX_IMAGE_BYTES) {
      return null;
    }
    const bytes = await res.Body!.transformToByteArray();
    return isJpeg(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

export async function deleteUpload(id: string): Promise<void> {
  // Best effort: the bucket's lifecycle rule removes leftovers after a day
  await s3.send(new DeleteObjectCommand({ Bucket: UPLOADS, Key: id })).catch(() => {});
}

/** Publishes an image that already passed moderation. */
export async function publishImage(key: string, bytes: Uint8Array): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: IMAGES,
      Key: key,
      Body: bytes,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function deleteImage(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: IMAGES, Key: key })).catch(() => {});
}
