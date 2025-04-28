const express = require('express');
const path = require('path');
const app = express();



app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.json());

const productsRouter = require('./app/routes/products');
const adminProductsRouter = require('./app/routes/adminProducts');

app.use('/products', productsRouter);
app.use('/admin/products', adminProductsRouter);

app.get(['/', '/home'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views', 'home.html')); 
});

app.get('/shopping_cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views', 'shopping_cart.html'));
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor funcionando en http://localhost:${PORT}`);
});