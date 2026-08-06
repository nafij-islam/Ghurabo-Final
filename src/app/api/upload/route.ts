import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const caption = formData.get('caption') as string | undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ghurabo-projects';
    const apiKey = process.env.CLOUDINARY_API_KEY || '491113329615225';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'RmUj7FKSvlupdz2nJ2NfptZmVUQ';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ghurabo-projects';

    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        // Signed upload signature calculation
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
        } else {
          // Try unsigned upload preset as secondary attempt
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
        console.warn('Cloudinary API upload error:', err);
      }
    }

    // Fallback: Return data URL directly for instant client-side preview
    return NextResponse.json({
      success: true,
      url: base64Data,
      publicId: `upload_${Date.now()}`,
      caption: caption || file.name,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
