import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const localEnv = await readFile(new URL('../.env.local', import.meta.url), 'utf8').catch(() => '');
for (const line of localEnv.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Missing Cloudinary env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

const timestamp = Math.floor(Date.now() / 1000);
const folder = 'bifti/verify';
const publicId = `bifti-verify-${timestamp}`;
const params = { folder, public_id: publicId, timestamp };
const toSign = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&') + apiSecret;
const signature = createHash('sha1').update(toSign).digest('hex');

const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const form = new FormData();
form.append('file', `data:image/png;base64,${pngBase64}`);
form.append('api_key', apiKey);
form.append('timestamp', String(timestamp));
form.append('signature', signature);
form.append('folder', folder);
form.append('public_id', publicId);

const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
const data = await response.json();
if (!response.ok) throw new Error(`Cloudinary verify failed: ${JSON.stringify(data)}`);

console.log('✓ Cloudinary connected');
console.log(`  cloud: ${cloudName}`);
console.log(`  key:   ${apiKey}`);
console.log(`  upload: ${data.secure_url}`);
console.log(`  public_id: ${data.public_id}`);
