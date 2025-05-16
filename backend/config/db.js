const mongoose = require('mongoose');

module.exports = async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt';
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB conectado');
    } catch (err) {
        console.error('❌ Error conectando a MongoDB:', err);
        process.exit(1);
    }
};
