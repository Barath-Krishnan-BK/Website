const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const mongoURI = 'mongodb+srv://barathkrishnan515:barathkrish25@bkcluster.irpvnvx.mongodb.net/mydatabase?retryWrites=true&w=majority';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Create uploads folder if not exists
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Mongoose schema
const fileSchema = new mongoose.Schema({
  filename: String,
  uploadDate: { type: Date, default: Date.now },
  url: String,
  prompt: String
});
const UploadedFile = mongoose.model('UploadedFile', fileSchema);

// Email setup (replace these with your real credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'barathkrishnan515@gmail.com',
    pass: 'uekf goyb ecpi jdpy' // Use Gmail App Password (not your real password)
  }
});

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

   const { prompt } = req.body;
  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    const newFile = new UploadedFile({
      filename: req.file.originalname,
      url: fileUrl,
      prompt
    });
    await newFile.save();

    // Send email with attachment
    await transporter.sendMail({
      from: '"File Upload Bot" <yourgmail@gmail.com>',
      to: 'barathkrishnan515@gmail.com',
      subject: '📎 New File Uploaded',
      text: `A new file has been uploaded: ${req.file.originalname}.\n\nPrompt: ${prompt}`,
      attachments: [
        {
          filename: req.file.originalname,
          path: path.join(__dirname, 'uploads', req.file.filename)
        }
      ]
    });

    res.status(200).json({ success: true, fileId: newFile._id });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
