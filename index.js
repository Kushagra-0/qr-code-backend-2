import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import qrCodeRoutes from './routes/qrCodeRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3010;

app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
  res.status(201).json({ msg: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://localhost:${port}`);
});
