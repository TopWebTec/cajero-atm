const express = require('express');
const fs = require('fs');
const path = require('path');

const {
    consultarEfectivo,
    agregarEfectivo,
    retirarEfectivo
} = require('../services/efectivo');

const {
    solicitarBancoCentral
} = require('../services/bancoCentral');

const router = express.Router();

// Ruta del archivo .env en la raíz del proyecto.
const ENV_PATH = path.resolve(__dirname, '../../.env');

// ============================================
// CONFIGURACIÓN DEL CAJERO
// ============================================

// Actualizar una variable en el archivo .env
// y también en la memoria del servidor.
function actualizarVariableEnv(clave, valor) {
    const valorSeguro = String(valor).replace(/[\r\n]/g, '');

    let contenido = fs.existsSync(ENV_PATH)
        ? fs.readFileSync(ENV_PATH, 'utf8')
        : '';

    const patron = new RegExp(`^${clave}=.*$`, 'm');
    const nuevaLinea = `${clave}=${valorSeguro}`;

    if (patron.test(contenido)) {
        contenido = contenido.replace(patron, nuevaLinea);
    } else {
        if (contenido.length > 0 && !contenido.endsWith('\n')) {
            contenido += '\n';
        }

        contenido += `${nuevaLinea}\n`;
    }

    fs.writeFileSync(ENV_PATH, contenido, 'utf8');
    process.env[clave] = valorSeguro;
}

// Consultar configuración actual.
router.get('/admin/config', (req, res) => {
    const apiKey = process.env.SUCURSAL_API_KEY;

    return res.json({
        success: true,
        apiKey: apiKey
            ? `••••••••${apiKey.slice(-4)}`
            : 'No configurada',
        nodeId: process.env.ATM_NODE_ID || '',
        centralUrl: process.env.CENTRAL_API_URL || ''
    });
});

// Guardar configuración del cajero.
router.post('/admin/config', (req, res) => {
    const { apiKey, nodeId, centralUrl } = req.body;

    if (typeof apiKey !== 'string' || !apiKey.trim()) {
        return res.status(400).json({
            success: false,
            error: 'La API Key es obligatoria.'
        });
    }

    if (/[\r\n]/.test(apiKey)) {
        return res.status(400).json({
            success: false,
            error: 'La API Key contiene caracteres no válidos.'
        });
    }

    if (
        nodeId !== undefined &&
        (typeof nodeId !== 'string' || /[\r\n]/.test(nodeId))
    ) {
        return res.status(400).json({
            success: false,
            error: 'El identificador del cajero no es válido.'
        });
    }

    if (
        centralUrl !== undefined &&
        (typeof centralUrl !== 'string' || /[\r\n]/.test(centralUrl))
    ) {
        return res.status(400).json({
            success: false,
            error: 'La URL del Banco Central no es válida.'
        });
    }

    if (centralUrl && centralUrl.trim()) {
        try {
            const url = new URL(centralUrl.trim());

            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Protocolo no válido.');
            }
        } catch {
            return res.status(400).json({
                success: false,
                error: 'Ingresa una URL válida del Banco Central.'
            });
        }
    }

    try {
        // Se conserva el nombre utilizado por bancoCentral.js.
        actualizarVariableEnv(
            'SUCURSAL_API_KEY',
            apiKey.trim()
        );

        if (nodeId !== undefined) {
            actualizarVariableEnv(
                'ATM_NODE_ID',
                nodeId.trim()
            );
        }

        if (centralUrl !== undefined && centralUrl.trim()) {
            actualizarVariableEnv(
                'CENTRAL_API_URL',
                centralUrl.trim().replace(/\/+$/, '')
            );
        }

        return res.json({
            success: true,
            mensaje: 'Configuración del cajero guardada correctamente.'
        });
    } catch (error) {
        console.error(
            'Error al guardar la configuración:',
            error.message
        );

        return res.status(500).json({
            success: false,
            error: 'No se pudo guardar la configuración en el archivo .env.'
        });
    }
});

// ============================================
// EFECTIVO LOCAL
// ============================================

// Consultar efectivo disponible.
router.get('/efectivo', (req, res) => {
    return res.json({
        success: true,
        efectivoDisponible: consultarEfectivo()
    });
});

// Consultar estado del cajero.
router.get('/status', (req, res) => {
    return res.json({
        success: true,
        message: 'Cajero ATM disponible',
        atm: {
            status: 'online',
            mode: 'local'
        }
    });
});

// Agregar efectivo al cajero.
router.post('/agregar', (req, res) => {
    const { cantidad } = req.body;

    if (
        typeof cantidad !== 'number' ||
        !Number.isFinite(cantidad) ||
        cantidad <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: 'La cantidad debe ser un número mayor que cero.'
        });
    }

    try {
        agregarEfectivo(cantidad);

        return res.json({
            success: true,
            message: 'Efectivo agregado correctamente.',
            efectivoDisponible: consultarEfectivo()
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================
// CONSULTAR SALDO
// ============================================

router.post('/saldo', async (req, res) => {
    const { cuenta } = req.body;

    if (
        typeof cuenta !== 'string' ||
        !/^[0-9]{1,16}$/.test(cuenta)
    ) {
        return res.status(400).json({
            success: false,
            message: 'Ingresa un número de cuenta válido.'
        });
    }

    try {
        const datos = await solicitarBancoCentral(
            `/accounts/${encodeURIComponent(cuenta)}`,
            { method: 'GET' }
        );

        return res.json({
            success: true,
            message: 'Consulta de cuenta realizada correctamente.',
            cuenta: datos.account ?? datos
        });
    } catch (error) {
        console.error(
            'Error al consultar la cuenta:',
            error.message
        );

        return res.status(error.status || 502).json({
            success: false,
            message: error.message,
            detalles: error.data ?? null
        });
    }
});

// ============================================
// RETIRAR EFECTIVO
// ============================================

router.post('/retirar', async (req, res) => {
    const { cuenta, monto } = req.body;

    if (
        typeof cuenta !== 'string' ||
        !/^[0-9]{1,16}$/.test(cuenta)
    ) {
        return res.status(400).json({
            success: false,
            message: 'Ingresa un número de cuenta válido.'
        });
    }

    if (
        typeof monto !== 'number' ||
        !Number.isFinite(monto) ||
        monto <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: 'El monto debe ser un número mayor que cero.'
        });
    }

    try {
        const efectivoDisponible = consultarEfectivo();

        if (monto > efectivoDisponible) {
            return res.status(400).json({
                success: false,
                message: 'El cajero no tiene suficiente efectivo disponible.',
                efectivoDisponible
            });
        }

        const resultado = await solicitarBancoCentral(
            '/atm/withdraw',
            {
                method: 'POST',
                body: JSON.stringify({
                    account_number: cuenta,
                    amount: monto
                })
            }
        );

        if (resultado?.success === false) {
            return res.status(400).json(resultado);
        }

        retirarEfectivo(monto);

        return res.json({
            success: true,
            message: 'Solicitud procesada correctamente.',
            resultado,
            efectivoDisponible
        });
    } catch (error) {
        console.error(
            'Error al procesar el retiro:',
            error.message
        );

        return res.status(error.status || 502).json({
            success: false,
            message: error.message,
            detalles: error.data ?? null
        });
    }
});

// ============================================
// DEPOSITAR DINERO
// ============================================

router.post('/depositar', async (req, res) => {
    const { cuenta, monto } = req.body;

    if (
        typeof cuenta !== 'string' ||
        !/^[0-9]{1,16}$/.test(cuenta)
    ) {
        return res.status(400).json({
            success: false,
            message: 'Ingresa un número de cuenta válido.'
        });
    }

    if (
        typeof monto !== 'number' ||
        !Number.isFinite(monto) ||
        monto <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: 'El monto debe ser un número mayor que cero.'
        });
    }

    try {
        const resultado = await solicitarBancoCentral(
            '/atm/deposit',
            {
                method: 'POST',
                body: JSON.stringify({
                    account_number: cuenta,
                    amount: monto
                })
            }
        );

        if (resultado?.success === false) {
            return res.status(400).json(resultado);
        }

        return res.json({
            success: true,
            message: 'Abono ingresado correctamente.',
            resultado
        });
    } catch (error) {
        console.error(
            'Error al procesar el abono:',
            error.message
        );

        return res.status(error.status || 502).json({
            success: false,
            message: error.message,
            detalles: error.data ?? null
        });
    }
});


/* GET /movimientos - Consulta el historial de Banco Central */
router.get('/movimientos', async (req, res) => {
    try {
        const datos = await solicitarBancoCentral(
            '/reports/transactions',
            { method: 'GET' }
        );

        return res.json({
            success: true,
            movimientos: datos.data ?? []
        });
    } catch (error) {
        console.error(
            'Error al consultar los movimientos:',
            error.message
        );

        return res.status(error.status || 502).json({
            success: false,
            message: error.message || 'No se pudieron consultar los movimientos.',
            detalles: error.data ?? null
        });
    }
});


module.exports = router;
