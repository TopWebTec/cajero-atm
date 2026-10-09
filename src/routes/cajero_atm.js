
const express = require('express');

const {
    consultarEfectivo,
    agregarEfectivo,
} = require('../services/efectivo');

const router = express.Router();

router.get('/efectivo', (req, res) => {
    res.json({
        success: true,
        efectivoDisponible: consultarEfectivo()
    });
});

router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Cajero ATM disponible',
        atm: {
            status: 'online',
            mode: 'local'
        }
    });
});

router.post('/agregar', (req, res) => {
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
            success: false,
            message: 'La cantidad debe ser mayor que cero'
        });
    }

            try {
            agregarEfectivo(Number(cantidad));

            return res.json({
                success: true,
                message: 'Efectivo agregado correctamente',
                efectivoDisponible: consultarEfectivo()
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

    });


// Retirar efectivo del cajero

router.post('/retirar', (req, res) => {
    const { cuenta, monto } = req.body;

    if (typeof cuenta !== 'string' || !/^[0-9]{1,16}$/.test(cuenta)) {
        return res.status(400).json({
            success: false,
            message: 'Ingresa un número de cuenta válido.'
        });
    }

    if (typeof monto !== 'number' || !Number.isFinite(monto) || monto <= 0) {
        return res.status(400).json({
            success: false,
            message: 'El monto debe ser un número mayor que cero.'
        });
    }

    return res.status(501).json({
        success: false,
        message: 'El retiro bancario estará disponible cuando se conecte banco-central.'
    });
});



router.post('/saldo', (req, res) => {
    const { cuenta } = req.body;

    if (typeof cuenta !== 'string' || !/^[0-9]{1,16}$/.test(cuenta)) {
        return res.status(400).json({
            success: false,
            message: 'Ingresa un número de cuenta válido.'
        });
    }

    return res.status(501).json({
        success: false,
        message: 'La consulta de saldo estará disponible cuando se conecte banco-central.'
    });
});

router.post('/depositar', (req, res) => {
    const { cuenta, monto } = req.body;

    if (typeof cuenta !== 'string' || !/^[0-9]{1,16}$/.test(cuenta)) {
        return res.status(400).json({
            success: false,
            message: 'Ingresa un número de cuenta válido.'
        });
    }

    if (typeof monto !== 'number' || !Number.isFinite(monto) || monto <= 0) {
        return res.status(400).json({
            success: false,
            message: 'El monto debe ser un número mayor que cero.'
        });
    }

    return res.status(501).json({
        success: false,
        message: 'El depósito estará disponible cuando se conecte banco-central.'
    });
});

module.exports = router;
