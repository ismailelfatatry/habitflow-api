require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes   = require('./routes/auth');
const habitsRoutes = require('./routes/habits');
const moodRoutes   = require('./routes/mood');
const reportRoutes = require('./routes/reports');

const app = express();
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/auth',    authRoutes);
app.use('/habits',  habitsRoutes);
app.use('/mood',    moodRoutes);
app.use('/reports', reportRoutes);

app.get('/health', (_, res) => res.json({ ok: true, message: 'HabitFlow API running' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`HabitFlow API running on port ${PORT}`));