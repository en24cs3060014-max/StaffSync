import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import hrRoutes from './src/routes/hr.js';
import attendanceRoutes from './src/routes/attendance.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'StaffSync API' }));
app.use('/api/auth', authRoutes);
app.use('/api', hrRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'A record with this value already exists.' });
  res.status(500).json({ message: 'Server error. Check the backend terminal for details.' });
});

const port = process.env.PORT || 5000;
try {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error('Set MONGO_URI and JWT_SECRET in backend/.env');
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => console.log(`StaffSync API running at http://localhost:${port}`));
} catch (error) {
  console.error('Could not start StaffSync:', error.message);
  process.exit(1);
}
