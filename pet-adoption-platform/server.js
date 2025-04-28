const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (CSS, JS, images) from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes to serve HTML pages
app.get(['/', '/home'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.get('/mis-solicitudes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'MisSolicitudes.html'));
});

app.get('/registrar-mascota', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'RegistrarMascota.html'));
});

app.get('/perfil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Perfil.html'));
});

// Pet detail route
app.get('/mascota/:petId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Details.html'));
});

// Fallback 404
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
