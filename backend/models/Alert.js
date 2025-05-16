const AlertSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:        String,
    breed:       String,
    city:        String,
    minAge:      Number,
    maxAge:      Number,
    createdAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('Alert', AlertSchema);
