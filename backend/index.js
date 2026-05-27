import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Route imports
import authRoutes from './routes/authRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import toolkitRoutes from './routes/toolkitRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.send('AI Tools Hub API is running...');
});

// Logo Proxy to eliminate console 404s
app.get('/api/utils/proxy-logo', async (req, res) => {
  const { domain, name } = req.query;
  
  if (!domain) {
    return res.status(200).send(Buffer.from(''));
  }

  // Try multiple sources in sequence
  const sources = [
    `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        // Check if we got a real image (not empty or too small)
        if (arrayBuffer.byteLength > 100) { 
          res.set('Content-Type', response.headers.get('content-type') || 'image/png');
          res.set('Cache-Control', 'public, max-age=86400');
          return res.send(Buffer.from(arrayBuffer));
        }
      }
    } catch (err) {
      // Fail silently and try next source
    }
  }

  // Final fallback to UI Avatars (Always works)
  try {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'AI')}&background=6366f1&color=fff&bold=true&size=128`;
    const fbResponse = await fetch(fallbackUrl);
    const fbArrayBuffer = await fbResponse.arrayBuffer();
    res.set('Content-Type', fbResponse.headers.get('content-type') || 'image/png');
    res.send(Buffer.from(fbArrayBuffer));
  } catch (fbError) {
    res.status(200).send(Buffer.from(''));
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/toolkits', toolkitRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-tools-hub';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
