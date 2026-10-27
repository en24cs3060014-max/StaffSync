import { Router } from 'express';
import Attendance from '../models/Attendance.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/mine', async (req, res, next) => {
  try { res.json(await Attendance.find({ user: req.user._id }).sort({ dateKey: -1 }).limit(60)); } catch (e) { next(e); }
});
router.post('/check-in', async (req, res, next) => {
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    const exists = await Attendance.findOne({ user: req.user._id, dateKey });
    if (exists) return res.status(409).json({ message: 'You have already checked in today.' });
    const record = await Attendance.create({ user: req.user._id, dateKey, checkIn: new Date() });
    res.status(201).json(record);
  } catch (e) { if (e.code === 11000) return res.status(409).json({ message: 'You have already checked in today.' }); next(e); }
});
router.post('/check-out', async (req, res, next) => {
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    const record = await Attendance.findOne({ user: req.user._id, dateKey });
    if (!record) return res.status(400).json({ message: 'Check in before checking out.' });
    if (record.checkOut) return res.status(409).json({ message: 'You have already checked out today.' });
    record.checkOut = new Date();
    await record.save();
    res.json(record);
  } catch (e) { next(e); }
});
export default router;
