import { Router } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';
import { User, Consultation } from '../models/index.js';

const router = Router();
const resetCodes = new Map();
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    })
  : { sendMail: async () => ({ mocked: true }) };

const publicUser = (user) => {
  if (!user) return null;
  const source = user.toJSON ? user.toJSON() : user;
  const { password, ...safe } = source;
  return safe;
};
const currentUser = (req) => req.session.user || null;
const requireLogin = (req, res, next) => currentUser(req) ? next() : res.status(401).json({ error: 'Unauthorized' });
const requireStaff = (req, res, next) => {
  if (!currentUser(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (!['admin', 'manager'].includes(currentUser(req).role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};
const serialize = (docs) => docs.map((doc) => doc.toJSON ? doc.toJSON() : doc);
const avatarColor = (name = '') => `avatar-${name.charAt(0).toLowerCase() || 'default'}`;
const mail = async (options) => {
  try { await transporter.sendMail({ from: process.env.SMTP_FROM || 'HOBUCO Consulting Services <hobucoltd2050@gmail.com>', ...options }); }
  catch (error) { console.error('Email delivery failed:', error.message); }
};

router.get('/session', (req, res) => res.json({ user: currentUser(req) }));
router.post('/logout', (req, res) => req.session.destroy(() => res.json({ success: true, redirectUrl: '/' })));

router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) return res.json({ success: false, message: 'All fields are required!' });
  const existing = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
  if (existing) return res.json({ success: false, message: existing.username === username ? 'Username is already taken.' : 'Email is already registered.' });
  const user = await User.create({ username, email, password: await bcrypt.hash(password, 10), role: ['admin', 'manager', 'client'].includes(role) ? role : 'client' });
  await mail({ to: user.email, subject: 'Welcome to HOBUCO - Your Account Has Been Created!', text: `Welcome to HOBUCO Consulting Services, ${user.username}. Your account has been successfully created.` });
  res.json({ success: true, message: 'Signup successful! You can now log in.' });
});

router.post('/login', async (req, res) => {
  const { username, password, remember } = req.body;
  if (!username) return res.json({ success: false, message: 'Username or email is required!' });
  if (!password) return res.json({ success: false, message: 'Password is required!' });
  const user = await User.findOne({ $or: [{ username }, { email: username.toLowerCase() }] });
  if (!user) return res.json({ success: false, message: 'Username or Email not found' });
  if (!await bcrypt.compare(password, user.password)) return res.json({ success: false, message: 'Incorrect password' });
  req.session.user = publicUser(user);
  req.session.cookie.maxAge = remember ? 30 * 24 * 60 * 60 * 1000 : undefined;
  res.json({ success: true, message: 'Login successful', redirectUrl: '/dashboard', user: req.session.user });
});

router.post('/forgot', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: 'Email not found' });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  resetCodes.set(email, { code, expires: Date.now() + 15 * 60 * 1000 });
  req.session.resetEmail = email;
  await mail({ to: email, subject: 'HOBUCO Password Reset Confirmation Code', text: `Your confirmation code is ${code}. It expires in 15 minutes.` });
  res.json({ success: true, message: 'Confirmation code sent.', redirectUrl: '/verify-code' });
});
router.post('/verify-code', (req, res) => {
  const email = req.session.resetEmail;
  const entry = resetCodes.get(email);
  if (!email || !entry || entry.expires < Date.now() || entry.code !== String(req.body.code || '')) return res.json({ success: false, message: 'Invalid code. Please try again.' });
  req.session.resetVerified = true;
  res.json({ success: true, redirectUrl: '/reset-password' });
});
router.post('/reset-password', async (req, res) => {
  const email = req.session.resetEmail;
  if (!email || !req.session.resetVerified) return res.json({ success: false, message: 'Reset verification is required.' });
  if (!req.body.password) return res.json({ success: false, message: 'Password is required.' });
  await User.updateOne({ email }, { $set: { password: await bcrypt.hash(req.body.password, 10) } });
  resetCodes.delete(email);
  delete req.session.resetEmail;
  delete req.session.resetVerified;
  res.json({ success: true, redirectUrl: '/login' });
});

router.get('/dashboard', requireLogin, async (req, res) => {
  const user = currentUser(req);
  const consultations = user.role === 'client' ? await Consultation.find({ email: user.email }).sort({ submitted_at: -1 }) : await Consultation.find().sort({ submitted_at: -1 });
  const users = ['admin', 'manager'].includes(user.role) ? await User.find().sort({ username: 1 }) : [];
  const safeUsers = serialize(users).map(({ password, ...rest }) => rest);
  res.json({ user, consultations: serialize(consultations), users: safeUsers, stats: {
    totalConsultations: consultations.length,
    totalUsers: safeUsers.length,
    totalAdmins: safeUsers.filter((item) => item.role === 'admin').length,
    totalClients: safeUsers.filter((item) => item.role === 'client').length,
    totalManagers: safeUsers.filter((item) => item.role === 'manager').length,
    pendingCount: consultations.filter((item) => item.status === 'pending').length,
    approvedCount: consultations.filter((item) => item.status === 'approved').length,
    dismissedCount: consultations.filter((item) => item.status === 'dismissed').length
  } });
});

router.post('/book-consultation', async (req, res) => {
  const payload = {
    first_name: req.body.firstName ?? req.body.first_name ?? '',
    last_name: req.body.lastName ?? req.body.last_name ?? '',
    email: String(req.body.email || '').trim().toLowerCase(),
    phone: req.body.phone || '',
    company_org: req.body.companyOrg ?? req.body.company_org ?? '',
    subject: req.body.subject || '',
    service: req.body.service || '',
    message: req.body.message || ''
  };
  if (!payload.first_name || !payload.last_name || !payload.email) return res.status(400).json({ success: false, message: 'First name, last name, and email are required.' });
  const consultation = await Consultation.create(payload);
  await mail({ to: payload.email, subject: 'Consultation Request Received', text: `Thank you ${payload.first_name}. We received your ${payload.subject} request.` });
  await mail({ to: process.env.ADMIN_EMAIL || 'mugishatumusifuchretien@gmail.com', subject: 'New Consultation Request Submitted', text: `${payload.first_name} ${payload.last_name} submitted a consultation request.` });
  res.json({ success: true, message: 'Consultation request submitted successfully.', consultation: consultation.toJSON() });
});

router.get('/consultations', requireStaff, async (req, res) => res.json({ consultations: serialize(await Consultation.find().sort({ submitted_at: -1 })) }));
router.get('/consultations/:id', requireLogin, async (req, res) => {
  const item = await Consultation.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});
router.put('/consultations/:id', requireLogin, async (req, res) => {
  const update = {
    first_name: String(req.body.first_name || '').trim(), last_name: String(req.body.last_name || '').trim(), email: String(req.body.email || '').trim().toLowerCase(), phone: String(req.body.phone || '').trim(), subject: String(req.body.subject || '').trim(), company_org: String(req.body.companyOrg ?? req.body.company_org ?? '').trim(), service: String(req.body.service || '').trim(), message: String(req.body.message || '').trim()
  };
  const item = await Consultation.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Consultation not found' });
  res.json({ success: true, message: 'Consultation updated successfully', consultation: item });
});
router.delete('/consultations/:id', requireLogin, async (req, res) => {
  const result = await Consultation.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: 'Consultation not found' });
  res.json({ success: true });
});
router.get('/search-consultations', requireStaff, async (req, res) => {
  const term = String(req.query.query || '').trim();
  const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const items = await Consultation.find(term ? { $or: [{ first_name: regex }, { last_name: regex }, { email: regex }, { phone: regex }, { company_org: regex }] } : {}).sort({ submitted_at: -1 });
  res.json(serialize(items));
});
router.get('/requests', requireStaff, async (req, res) => res.json({ consultations: serialize(await Consultation.find().sort({ submitted_at: -1 })) }));
router.post('/requests/action/:id', requireStaff, async (req, res) => {
  const newStatus = req.body.action === 'approve' ? 'approved' : req.body.action === 'dismiss' ? 'dismissed' : null;
  if (!newStatus) return res.status(400).json({ success: false, message: 'Invalid action' });
  const item = await Consultation.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
  if (!item) return res.status(404).json({ success: false, message: 'Consultation not found' });
  await mail({ to: item.email, subject: `Consultation ${newStatus}`, text: `Your consultation request has been ${newStatus}.` });
  res.json({ success: true, message: `Consultation ${newStatus}`, consultation: item });
});

router.get('/users', requireStaff, async (_req, res) => res.json({ users: serialize(await User.find().sort({ username: 1 })).map(publicUser) }));
router.get('/users/:id', requireStaff, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(publicUser(user));
});
router.put('/users/:id', requireStaff, async (req, res) => {
  const update = { username: req.body.username, email: req.body.email, role: req.body.role };
  if (req.body.password) update.password = await bcrypt.hash(req.body.password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: publicUser(user) });
});
router.delete('/users/:id', requireStaff, async (req, res) => {
  const result = await User.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true });
});
router.get('/search-users', requireStaff, async (req, res) => {
  const term = String(req.query.query || '').trim();
  const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find(term ? { $or: [{ username: regex }, { email: regex }, { role: regex }] } : {}).sort({ username: 1 });
  res.json(users.map(publicUser));
});

async function workbookResponse(res, filename, sheetName, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns;
  worksheet.getRow(1).eachCell((cell) => { cell.font = { bold: true }; cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
  rows.forEach((row) => { const added = worksheet.addRow(row); added.eachCell((cell) => { cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; }); });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  res.end();
}
router.get('/export/consultations', requireStaff, async (_req, res) => workbookResponse(res, 'consultations.xlsx', 'Consultations', [
  { header: 'First Name', key: 'first_name', width: 20 }, { header: 'Last Name', key: 'last_name', width: 20 }, { header: 'Email', key: 'email', width: 30 }, { header: 'Phone', key: 'phone', width: 15 }, { header: 'Subject', key: 'subject', width: 20 }, { header: 'Company', key: 'company_org', width: 25 }, { header: 'Service', key: 'service', width: 25 }, { header: 'Message', key: 'message', width: 30 }, { header: 'Status', key: 'status', width: 15 }
], serialize(await Consultation.find().sort({ submitted_at: -1 }))));
router.get('/export/users/:role', requireStaff, async (req, res) => {
  const role = req.params.role;
  if (!['admin', 'client', 'manager', 'all'].includes(role)) return res.status(400).send('Invalid role specified');
  const filter = role === 'all' ? {} : { role };
  const users = serialize(await User.find(filter).sort({ username: 1 })).map(publicUser);
  return workbookResponse(res, `users-${role}.xlsx`, `${role[0].toUpperCase()}${role.slice(1)} Users`, [{ header: 'Username', key: 'username', width: 20 }, { header: 'Email', key: 'email', width: 30 }, { header: 'Role', key: 'role', width: 15 }], users);
});

router.get('/client', requireLogin, async (req, res) => {
  if (currentUser(req).role !== 'client') return res.status(403).json({ error: 'Forbidden' });
  res.json({ consultations: serialize(await Consultation.find({ email: currentUser(req).email }).sort({ submitted_at: -1 })) });
});

export default router;
