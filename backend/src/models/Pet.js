const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
  owner:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, required: true }, // Se validará contra seed.petTypes externamente
  breed:     String,
  name:      String,
  sex:       { type: String, enum: ['M','F'] },
  age:       Number,
  city:      String,
  description:String,
  photos:    [String],
  status:    { type: String, enum: ['available','in_process','adopted'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});
// Índice para evitar duplicados
petSchema.index({ owner: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Pet', petSchema);
