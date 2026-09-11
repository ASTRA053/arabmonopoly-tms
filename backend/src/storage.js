import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const bucket = process.env.OBJECT_STORAGE_BUCKET;
const publicBaseUrl = process.env.OBJECT_STORAGE_PUBLIC_URL;
const client = process.env.OBJECT_STORAGE_ENDPOINT && process.env.OBJECT_STORAGE_ACCESS_KEY && process.env.OBJECT_STORAGE_SECRET_KEY
  ? new S3Client({
      endpoint: process.env.OBJECT_STORAGE_ENDPOINT,
      region: process.env.OBJECT_STORAGE_REGION || 'auto',
      forcePathStyle: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE === 'true',
      credentials: { accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY, secretAccessKey: process.env.OBJECT_STORAGE_SECRET_KEY },
    })
  : null;

export async function storeDeliveryPhoto(dataUrl, key) {
  if (!client || !bucket || !publicBaseUrl) {
    throw new Error('Object storage is not configured. Set OBJECT_STORAGE_* variables on Render.');
  }
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) throw new Error('Delivery photo must be a base64 image data URL');
  const [, contentType, encoded] = match;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: Buffer.from(encoded, 'base64'), ContentType: contentType, CacheControl: 'public, max-age=31536000' }));
  return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
}
