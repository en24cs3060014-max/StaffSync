import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Announcement from './src/models/Announcement.js';
import Training from './src/models/Training.js';

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error('Set backend/.env first.');
await mongoose.connect(process.env.MONGO_URI);
const password = await bcrypt.hash('StaffSync123!', 12);
const demos = [
  { name: 'Harper HR', email: 'hr@staffsync.demo', role: 'hr', department: 'People & Culture', jobTitle: 'HR Administrator' },
  { name: 'Morgan Manager', email: 'manager@staffsync.demo', role: 'manager', department: 'Engineering', jobTitle: 'Team Manager' },
  { name: 'Alex Employee', email: 'employee@staffsync.demo', role: 'employee', department: 'Engineering', jobTitle: 'Software Engineer' }
];
for (const item of demos) {
  await User.updateOne({ email: item.email }, { $set: { ...item, password } }, { upsert: true });
}
const hr = await User.findOne({ email: 'hr@staffsync.demo' });
if (!(await Announcement.exists({ title: 'Welcome to StaffSync' }))) {
  await Announcement.create({ title: 'Welcome to StaffSync', body: 'Welcome! Use this workspace to manage your HR tasks and keep your profile up to date.', author: hr._id });
}
if (!(await Training.exists({ title: 'Security Awareness Essentials' }))) {
  await Training.create({ title: 'Security Awareness Essentials', description: 'Learn practical steps for protecting company data and accounts.', date: new Date(Date.now() + 7 * 86400000), duration: '90 minutes', createdBy: hr._id });
}
console.log('Demo accounts ready. Password for all: StaffSync123!');
await mongoose.disconnect();
