const { Schema, model } = require('mongoose');

const habitSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:         { type: String, required: true, trim: true, maxlength: 80 },
  category:     { type: String, enum: ['health','learn','mind','fit','work','personal'], default: 'health' },
  frequency:    { type: String, enum: ['daily','weekly'], default: 'daily' },
  reminderTime: { type: String, default: '' },
  logs:         [{ type: String }],
}, { timestamps: true });

module.exports = model('Habit', habitSchema);