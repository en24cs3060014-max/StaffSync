import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const publicUser = (user) => ({
  id: user._id, name: user.name, email: user.email, role: user.role,
  department: user.department, jobTitle: user.jobTitle, phone: user.phone
});
const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, department, jobTitle } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: 'Name, email and a password of at least 8 characters are required.' });
    }
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email is already registered.' });
    // Public sign-up always creates an employee. Privileged roles are assigned by an administrator.
    const user = await User.create({
      name, email, password: await bcrypt.hash(password, 12),
      department: department || 'General', jobTitle: jobTitle || 'Team Member', role: 'employee'
    });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
