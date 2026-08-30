import { NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { file } = body;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const uploadedUrl = await uploadImageToCloudinary(file);
    return NextResponse.json({ url: uploadedUrl });
  } catch (error: any) {
    console.error('Image Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
