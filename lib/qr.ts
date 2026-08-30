import QRCode from 'qrcode';

export async function generateProductQRCode(sku: string, baseUrl?: string): Promise<string> {
  let origin = baseUrl;
  if (!origin) {
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
      origin = window.location.origin;
    } else {
      origin = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    }
  }
  const verificationUrl = `${origin}/p/${encodeURIComponent(sku)}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#0f172a',  // Deep Slate / Jet Black
        light: '#ffffff', // Crisp White
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error('Failed to generate QR code for SKU:', sku, err);
    return '';
  }
}

export function getPublicVerificationUrl(sku: string, baseUrl?: string): string {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${origin}/p/${encodeURIComponent(sku)}`;
}
