const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir);
}

// Model files to download
const modelFiles = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

// Download each file
modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const fileStream = fs.createWriteStream(filePath);

    https.get(baseUrl + file, response => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            console.log(`Downloaded: ${file}`);
        });
    }).on('error', err => {
        console.error(`Error downloading ${file}:`, err);
    });
});
