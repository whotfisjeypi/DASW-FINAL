const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adoptionRequestSchema = new Schema({
  pet:       { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message:   String,
  status:    { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
// Único por { pet, applicant }
adoptionRequestSchema.index({ pet: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
