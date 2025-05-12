const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alertSchema = new Schema({
  user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:    String,
  breed:   String,
  city:    String,
  ageMin:  Number,
  ageMax:  Number,
  active:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
