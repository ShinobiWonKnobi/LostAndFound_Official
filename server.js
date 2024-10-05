import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User model
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  isAdmin: Boolean,
});

const User = mongoose.model('User', UserSchema);

// Item model
const ItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  status: { type: String, default: 'Lost' },
  lastSeen: String,
  description: String,
  contactName: String,
  contactEmail: String,
  contactPhone: String,
  imageUrl: String,
  date: { type: Date, default: Date.now },
});

const Item = mongoose.model('Item', ItemSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  next();
};

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      isAdmin: false,
    });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
      res.json({ token, isAdmin: user.isAdmin });
    } else {
      res.status(400).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

app.post('/api/items', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const item = new Item({
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).send('Error creating item');
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find({ status: 'Lost' });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
});

app.get('/api/admin/items', authenticateToken, isAdmin, async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching admin items:', error);
    res.status(500).send('Error fetching admin items');
  }
});

app.put('/api/admin/items/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (item.status === 'Found') {
      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: item.contactEmail,
        subject: 'Your Lost Item Has Been Found',
        text: `Good news! Your lost item "${item.name}" has been found. Please contact the lost and found office to retrieve it.`,
      };
      transporter.sendMail(mailOptions);
    }
    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Error updating item');
  }
});

app.delete('/api/admin/items/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Error deleting item');
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    const items = await Item.find({
      $and: [
        { status: 'Lost' },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
          ],
        },
      ],
    });
    res.json(items);
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).send('Error searching items');
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));