
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.use(express.static(path.join(__dirname, 'public')));

const atmRoutes = require('./src/routes/cajero_atm');

app.use('/api/atm', atmRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ATM ejecutándose en el puerto ${PORT}`);
});
