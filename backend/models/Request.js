const RequestSchema = new mongoose.Schema({
    pet:         { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    requester:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status:      { type: String, enum: ['Pendiente','Aprobada','Rechazada'], default: 'Pendiente' },
    createdAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('Request', RequestSchema);
