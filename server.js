require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // store file in memory temporarily

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

let db, bucket;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db('fileuploads'); // DB name
  bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  console.log('Connected to MongoDB');
}

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Create upload stream into GridFS
  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
  });

  uploadStream.end(req.file.buffer);

  uploadStream.on('finish', () => {
    res.json({ fileId: uploadStream.id.toString(), filename: req.file.originalname });
  });

  uploadStream.on('error', (err) => {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  });
});

connectDB().catch((err) => {
  console.error(err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
