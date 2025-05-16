const PetSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    type:        { type: String, required: true },  // perro, gato, etc.
    breed:       { type: String },
    age:         { type: Number },
    city:        { type: String },
    description: { type: String },
    images:      [String],                         // URLs externas
    status:      { type: String, enum: ['Disponible','En proceso','Adoptado'], default: 'Disponible' },
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
module.exports = mongoose.model('Pet', PetSchema);
