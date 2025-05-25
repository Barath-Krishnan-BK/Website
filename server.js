const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize app
const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const mongoURI = 'mongodb+srv://barathkrishnan515:barathkrish25@bkcluster.irpvnvx.mongodb.net/mydatabase?retryWrites=true&w=majority'; // <- Replace this!
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Create upload folder if it doesn’t exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Mongoose model
const fileSchema = new mongoose.Schema({
  filename: String,
  uploadDate: { type: Date, default: Date.now },
  url: String
});
const UploadedFile = mongoose.model('UploadedFile', fileSchema);

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  try {
    const newFile = new UploadedFile({
      filename: req.file.originalname,
      url: fileUrl
    });

    await newFile.save();

    console.log('📁 File uploaded and saved in MongoDB:', newFile);
    res.status(200).json({ success: true, fileId: newFile._id });
  } catch (error) {
    console.error('❌ Error saving to MongoDB:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
