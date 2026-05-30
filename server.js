const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');

const authRoutes   = require('./routes/auth');
const habitsRoutes = require('./routes/habits');
const moodRoutes   = require('./routes/mood');
const reportRoutes = require('./routes/reports');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/auth',    authRoutes);
app.use('/habits',  habitsRoutes);
app.use('/mood',    moodRoutes);
app.use('/reports', reportRoutes);

app.get('/health', (_, res) => res.json({ ok: true, message: 'HabitFlow API running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`HabitFlow API running on port ${PORT}`));