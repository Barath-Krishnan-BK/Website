// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Multer for file uploads (destination folder 'uploads')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure this folder exists or create it manually
  },
  filename: (req, file, cb) => {
    // Save the file with original name + timestamp to avoid duplicates
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage });

// MongoDB Connection (keep as before)
const mongoURI = 'mongodb+srv://barathkrishnan515:barathkrish25@bkcluster.irpvnvx.mongodb.net/mydatabase?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema and Model for saving info about uploads (optional)
const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
  createdAt: { type: Date, default: Date.now }
});
const Image = mongoose.model('Image', imageSchema);

// POST route for file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Save file info in DB (optional)
    const newImage = new Image({
      filename: req.file.filename,
      path: req.file.path,
    });
    await newImage.save();

    res.json({ success: true, fileId: newImage._id, filename: req.file.filename });
  } catch (error) {
    console.error('Error saving file info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test GET route
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
