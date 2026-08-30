import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export async function uploadImageToCloudinary(fileBase64: string, folder = 'silver_inventory') {
  if (!process.env.CLOUDINARY_API_KEY) {
    // Fallback if user has not entered Cloudinary keys yet: Return standard placeholder or base64 directly
    return fileBase64;
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export default cloudinary;
