import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetURL = 'https://mmc-mms.com';
const outputPath = path.join(__dirname, 'public', 'qr-mmc-mms-com.png');

// QR Code options for high quality
const options = {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 1,
    margin: 2,
    width: 600,
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    }
};

console.log('🎯 Creating QR Code...');
console.log('📝 URL:', targetURL);
console.log('💾 Output:', outputPath);

QRCode.toFile(outputPath, targetURL, options, function (err) {
    if (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }

    console.log('✅ QR Code created successfully!');
    console.log('📐 Size: 600x600 pixels');
    console.log('🎨 Format: PNG');
    console.log('🔗 URL: https://mmc-mms.com');
    console.log('📂 Location: public/qr-mmc-mms-com.png');
    console.log('');
    console.log('🎉 Done! You can now use this QR code for printing and sharing.');
});
