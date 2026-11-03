import { createHash } from 'crypto';

/** Read lazily: on Workers, secrets are only on process.env while a request is being handled. */
function env() {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET || '',
  };
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = env();
  return Boolean(cloudName && apiKey && apiSecret);
}

export function cloudinaryUrl(publicId: string, options: { width?: number; height?: number; crop?: string; resourceType?: 'image' | 'raw' | 'auto' } = {}) {
  const { cloudName } = env();
  if (!cloudName || !publicId) return '';
  const resourceType = options.resourceType || 'image';
  const transforms = [
    options.width ? `w_${options.width}` : '',
    options.height ? `h_${options.height}` : '',
    options.crop ? `c_${options.crop}` : resourceType === 'image' ? 'c_fill' : '',
    resourceType === 'image' ? 'f_auto' : '',
    resourceType === 'image' ? 'q_auto' : '',
  ].filter(Boolean).join(',');
  const transformSegment = transforms ? `${transforms}/` : '';
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformSegment}${publicId.replace(/^\//, '')}`;
}

export function mediaPlaceholder(kind: 'course' | 'avatar' | 'pdf', seed: string) {
  const safe = encodeURIComponent(seed.replace(/\s+/g, '-').toLowerCase());
  if (kind === 'avatar') {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${safe}&backgroundColor=1738a8&textColor=ffffff`;
  }
  if (kind === 'pdf') return '';
  return `https://placehold.co/800x450/1738a8/ffffff/png?text=${safe}`;
}

export function resolveMediaUrl(storedUrl: string | undefined, kind: 'course' | 'avatar', seed: string, publicId?: string) {
  const { cloudName } = env();
  if (storedUrl) return storedUrl;
  if (publicId && cloudName) {
    return cloudinaryUrl(publicId, kind === 'avatar' ? { width: 160, height: 160, crop: 'fill' } : { width: 800, height: 450, crop: 'fill' });
  }
  return mediaPlaceholder(kind, seed);
}

function signParams(params: Record<string, string | number>) {
  const { apiSecret } = env();
  const toSign = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
}

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format?: string;
  bytes?: number;
};

/** Signed server-side upload for images, PDFs and other media. */
export async function uploadToCloudinary(
  file: Buffer | Blob,
  options: { folder?: string; publicId?: string; resourceType?: 'image' | 'raw' | 'auto'; filename?: string } = {},
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = env();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = options.folder ? (options.folder.startsWith('bifti/') ? options.folder : `bifti/${options.folder}`) : 'bifti/uploads';
  const resourceType = options.resourceType || 'auto';
  const params: Record<string, string | number> = { folder, timestamp };
  if (options.publicId) params.public_id = options.publicId;

  const signature = signParams(params);
  const form = new FormData();
  const blob = file instanceof Blob ? file : new Blob([new Uint8Array(file)]);
  form.append('file', blob, options.filename || 'upload.bin');
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);
  if (options.publicId) form.append('public_id', options.publicId);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) throw new Error(`Cloudinary upload failed: ${await response.text()}`);
  return response.json() as Promise<CloudinaryUploadResult>;
}

/** Unsigned upload when a browser preset is configured. */
export async function uploadUnsigned(file: Blob, folder: string, filename?: string) {
  const { cloudName, uploadPreset } = env();
  if (!cloudName || !uploadPreset) {
    throw new Error('Unsigned upload needs NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
  }
  const form = new FormData();
  form.append('file', file, filename || 'upload.bin');
  form.append('upload_preset', uploadPreset);
  form.append('folder', folder.startsWith('bifti/') ? folder : `bifti/${folder}`);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: form });
  if (!response.ok) throw new Error(`Cloudinary unsigned upload failed: ${await response.text()}`);
  return response.json() as Promise<CloudinaryUploadResult>;
}

/** Build a browser-friendly PDF delivery URL (inline viewing in our PdfViewer). */
export function pdfDeliveryUrl(publicIdOrUrl: string) {
  if (!publicIdOrUrl) return '';
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) return publicIdOrUrl;
  return cloudinaryUrl(publicIdOrUrl, { resourceType: 'raw' });
}

/** Signed params for direct browser uploads when needed. */
export function createUploadSignature(options: { folder?: string; publicId?: string } = {}) {
  const { cloudName, apiKey, apiSecret } = env();
  if (!apiSecret || !apiKey || !cloudName) throw new Error('Cloudinary is not configured.');
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = options.folder
    ? (options.folder.startsWith('bifti/') ? options.folder : `bifti/${options.folder}`)
    : 'bifti/uploads';
  const params: Record<string, string | number> = { folder, timestamp };
  if (options.publicId) params.public_id = options.publicId;
  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    publicId: options.publicId || null,
    signature: signParams(params),
  };
}

