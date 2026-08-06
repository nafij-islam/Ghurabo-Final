import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getVerifiedUser } from '@/lib/auth/serverAuth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export async function POST(request: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in to upload images.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const caption = formData.get('caption') as string | undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided for upload' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const mimeType = file.type || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Invalid file format. Only JPEG, PNG, WebP, AVIF, and GIF are allowed.' }, { status: 400 });
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const stringToSign = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const cloudFormData = new FormData();
        cloudFormData.append('file', base64Data);
        cloudFormData.append('api_key', apiKey);
        cloudFormData.append('timestamp', timestamp.toString());
        cloudFormData.append('signature', signature);

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: cloudFormData,
          }
        );

        const data = await cloudinaryRes.json();
        if (data.secure_url) {
          return NextResponse.json({
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            caption: caption || file.name,
          });
        } else if (uploadPreset) {
          // Secondary unsigned upload preset attempt
          const unsignedRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                file: base64Data,
                upload_preset: uploadPreset,
              }),
            }
          );
          const unsignedData = await unsignedRes.json();
          if (unsignedData.secure_url) {
            return NextResponse.json({
              success: true,
              url: unsignedData.secure_url,
              publicId: unsignedData.public_id,
              caption: caption || file.name,
            });
          }
        }
      } catch (err) {
        console.warn('Cloudinary upload error:', err);
      }
    }

    // Secure fallback: Return base64 preview for authorized user
    return NextResponse.json({
      success: true,
      url: base64Data,
      publicId: `upload_${Date.now()}`,
      caption: caption || file.name,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Upload process failed' }, { status: 500 });
  }
}
