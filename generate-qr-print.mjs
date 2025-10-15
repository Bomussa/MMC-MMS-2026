import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetURL = 'https://mmc-mms.com';

// Create high-resolution QR code for printing
const printPath = path.join(__dirname, 'public', 'qr-mmc-mms-com-print.png');
const printOptions = {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 1,
    margin: 4,
    width: 1200,
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    }
};

console.log('🖨️ Creating high-resolution QR Code for printing...');

QRCode.toFile(printPath, targetURL, printOptions, function (err) {
    if (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
    
    console.log('✅ Print-quality QR Code created!');
    console.log('📐 Size: 1200x1200 pixels (High Resolution)');
    console.log('🎨 Format: PNG');
    console.log('📂 Location: public/qr-mmc-mms-com-print.png');
    console.log('');
    console.log('🎉 Perfect for printing posters and banners!');
});
