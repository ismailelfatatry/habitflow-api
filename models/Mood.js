const { Schema, model } = require('mongoose');

const moodSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date:      { type: String, required: true },
  moodIndex: { type: Number, required: true, min: 0, max: 7 },
}, { timestamps: true });

moodSchema.index({ userId: 1, date: 1 }, { unique: true });
module.exports = model('Mood', moodSchema);