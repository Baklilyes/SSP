const fs = require('fs');
const src = 'C:/Users/admin.bouira/.gemini/antigravity-cli/brain/ce300215-ce13-45b6-9889-a8bfa5b921b2/.user_uploaded/uploaded_media_1795009713423.jpg';
const data = fs.readFileSync(src).toString('base64');
const tsContent = `// Base64 encoded OSI 7-Layer Model infographic\nexport const OSI_MODEL_INFOGRAPHIC = 'data:image/jpeg;base64,${data}';\n`;
fs.writeFileSync('components/osi/osiImageBase64.ts', tsContent);
console.log('Successfully generated components/osi/osiImageBase64.ts, size:', tsContent.length);
