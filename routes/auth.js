const router     = require('express').Router();
const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const User       = require('../models/User');
const authMW     = require('../middleware/auth');

const sign  = id => jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: '7d' });
const signR = id => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be 8+ characters' });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already in use' });
    const user    = await User.create({ name, email, password });
    const token   = sign(user._id);
    const refresh = signR(user._id);
    user.refreshTokens.push(refresh);
    await user.save();
    res.status(201).json({
      token, refreshToken: refresh,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    const token   = sign(user._id);
    const refresh = signR(user._id);
    user.refreshTokens.push(refresh);
    await user.save();
    res.json({
      token, refreshToken: refresh,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
    const { id } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user   = await User.findById(id);
    if (!user || !user.refreshTokens.includes(refreshToken))
      return res.status(401).json({ message: 'Invalid refresh token' });
    res.json({ token: sign(id) });
  } catch { res.status(401).json({ message: 'Invalid refresh token' }); }
});

router.get('/me', authMW, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshTokens');
  res.json({ user });
});

router.post('/logout', authMW, async (req, res) => {
  const { refreshToken } = req.body;
  await User.findByIdAndUpdate(req.user.id, { $pull: { refreshTokens: refreshToken } });
  res.json({ ok: true });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ ok: true });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken       = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: 587, secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from:    `"HabitFlow" <${process.env.SMTP_USER}>`,
      to:      user.email,
      subject: 'Reset your HabitFlow password',
      html:    `<p>Click <a href="${process.env.APP_URL}/reset-password?token=${token}">here</a> to reset your password. Expires in 1 hour.</p>`
    });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;