import { Router } from 'express';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Announcement from '../models/Announcement.js';
import Training from '../models/Training.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/employees', allowRoles('hr', 'manager'), async (req, res, next) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, department: u.department, jobTitle: u.jobTitle })));
  } catch (e) { next(e); }
});

router.get('/attendance', allowRoles('hr', 'manager'), async (req, res, next) => {
  try {
    const rows = await Attendance.find().populate('user', 'name email department').sort({ dateKey: -1 }).limit(200);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/leaves', async (req, res, next) => {
  try {
    const query = ['hr', 'manager'].includes(req.user.role) ? {} : { user: req.user._id };
    const rows = await Leave.find(query).populate('user', 'name email department').populate('reviewedBy', 'name').sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/leaves', async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason?.trim() || new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'Provide valid dates and a reason. End date must not precede start date.' });
    }
    const leave = await Leave.create({ user: req.user._id, type, startDate, endDate, reason });
    res.status(201).json(await leave.populate('user', 'name email department'));
  } catch (e) { next(e); }
});

router.patch('/leaves/:id/review', allowRoles('hr', 'manager'), async (req, res, next) => {
  try {
    const { status, reviewNote = '' } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be approved or rejected.' });
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status, reviewNote, reviewedBy: req.user._id }, { new: true, runValidators: true }).populate('user', 'name email department').populate('reviewedBy', 'name');
    if (!leave) return res.status(404).json({ message: 'Leave request not found.' });
    res.json(leave);
  } catch (e) { next(e); }
});

router.get('/announcements', async (req, res, next) => {
  try { res.json(await Announcement.find().populate('author', 'name').sort({ createdAt: -1 })); } catch (e) { next(e); }
});
router.post('/announcements', allowRoles('hr'), async (req, res, next) => {
  try {
    const { title, body } = req.body;
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ message: 'Title and message are required.' });
    res.status(201).json(await (await Announcement.create({ title, body, author: req.user._id })).populate('author', 'name'));
  } catch (e) { next(e); }
});

router.get('/trainings', async (req, res, next) => {
  try { res.json(await Training.find().populate('createdBy', 'name').sort({ date: 1 })); } catch (e) { next(e); }
});
router.post('/trainings', allowRoles('hr', 'manager'), async (req, res, next) => {
  try {
    const { title, description, date, duration } = req.body;
    if (!title?.trim() || !description?.trim() || !date) return res.status(400).json({ message: 'Title, description and date are required.' });
    res.status(201).json(await (await Training.create({ title, description, date, duration, createdBy: req.user._id })).populate('createdBy', 'name'));
  } catch (e) { next(e); }
});

router.get('/summary', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [employees, pendingLeaves, presentToday, announcements, trainings] = await Promise.all([
      User.countDocuments(), Leave.countDocuments({ status: 'pending' }),
      Attendance.countDocuments({ dateKey: today }), Announcement.countDocuments(), Training.countDocuments()
    ]);
    res.json({ employees, pendingLeaves, presentToday, announcements, trainings });
  } catch (e) { next(e); }
});

router.patch('/profile', async (req, res, next) => {
  try {
    const { name, department, jobTitle, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, {
      ...(name !== undefined && { name }), ...(department !== undefined && { department }),
      ...(jobTitle !== undefined && { jobTitle }), ...(phone !== undefined && { phone })
    }, { new: true, runValidators: true });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, jobTitle: user.jobTitle, phone: user.phone } });
  } catch (e) { next(e); }
});

export default router;
