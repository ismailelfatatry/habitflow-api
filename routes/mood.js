const router = require('express').Router();
const authMW = require('../middleware/auth');
const Mood   = require('../models/Mood');

router.use(authMW);

router.get('/', async (req, res) => {
  const entries = await Mood.find({ userId: req.user.id }).sort('date');
  res.json(entries);
});

router.post('/', async (req, res) => {
  const { date, moodIndex } = req.body;
  const entry = await Mood.findOneAndUpdate(
    { userId: req.user.id, date },
    { moodIndex },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(entry);
});

module.exports = router;