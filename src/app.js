import express from 'express';
import zlib from 'zlib';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..'); 

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.static(path.join(rootDir, 'public')));

app.post('/upload', (req, res) => {
    const uploadDir = path.join(rootDir, 'public', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, 'upload_file1.txt');
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
        res.redirect('/');
    });

    writeStream.on('error', (error) => {
        res.status(500).send('Uploading error: ' + error.message);
    });
});

app.get('/download', (req, res) => {
    const fileName = req.query.fileName || 'sample-2mb.txt';
    const filePath = path.join(rootDir, 'public', fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Filenot found');
    }

    const readStream = fs.createReadStream(filePath);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    readStream.pipe(res);
});

app.get('/download-compression', (req, res) => {
    const fileName = req.query.fileName || 'sample-2mb.txt';
    const filePath = path.join(rootDir, 'public', fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    const readStream = fs.createReadStream(filePath);
    const gZib = zlib.createGzip();

    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.gz`);

    readStream.pipe(gZib).pipe(res);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});