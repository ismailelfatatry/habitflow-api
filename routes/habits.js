const router = require('express').Router();
const authMW = require('../middleware/auth');
const Habit  = require('../models/Habit');

router.use(authMW);

router.get('/', async (req, res) => {
  const habits = await Habit.find({ userId: req.user.id }).sort('-createdAt');
  res.json(habits.map(h => ({ ...h.toObject(), id: h._id })));
});

router.post('/', async (req, res) => {
  const habit = await Habit.create({ userId: req.user.id, ...req.body });
  res.status(201).json({ ...habit.toObject(), id: habit._id });
});

router.put('/:id', async (req, res) => {
  const h = await Habit.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id }, req.body, { new: true }
  );
  h ? res.json({ ...h.toObject(), id: h._id }) : res.status(404).json({ message: 'Not found' });
});

router.delete('/:id', async (req, res) => {
  await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ ok: true });
});

router.post('/:id/log', async (req, res) => {
  const { date } = req.body;
  const h = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
  if (!h) return res.status(404).json({ message: 'Not found' });
  const idx = h.logs.indexOf(date);
  if (idx > -1) h.logs.splice(idx, 1); else h.logs.push(date);
  await h.save();
  res.json({ ...h.toObject(), id: h._id });
});

module.exports = router;