document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const cuentaGuardada = params.get('cuenta') || sessionStorage.getItem('cuentaATM');
    if (cuentaGuardada) {
        const inputCta = document.getElementById('cuenta');
        if (inputCta) {
            inputCta.value = cuentaGuardada;
        }
        const sesionTexto = document.getElementById('sesionActual');
        if (sesionTexto) {
            sesionTexto.textContent = `Sesión iniciada con la cuenta: ${cuentaGuardada}`;
        }
    }
});

let operacionActual = '';

const panelOperacion = document.getElementById('panelOperacion');
const formularioOperacion = document.getElementById('formOperacion');
const campoCuenta = document.getElementById('campoCuenta');
const campoMonto = document.getElementById('campoMonto');
const inputCuenta = document.getElementById('cuenta');
const inputMonto = document.getElementById('monto');
const mensaje = document.getElementById('mensaje');

function seleccionarMonto(cantidad) {
    inputMonto.value = cantidad;
}

function mostrarOperacion(tipo) {
    operacionActual = tipo;

    formularioOperacion.reset();
    mensaje.textContent = '';

    const cuentaSesion = sessionStorage.getItem('cuentaATM') || new URLSearchParams(window.location.search).get('cuenta');
    if (cuentaSesion) {
        inputCuenta.value = cuentaSesion;
        inputCuenta.readOnly = true;
    }

    const titulos = {
        saldo: 'Consultar saldo',
        retiro: 'Retirar efectivo',
        deposito: 'Depositar dinero',
        movimientos: 'Consultar movimientos'
    };

    document.getElementById('tituloOperacion').textContent =
        titulos[tipo] || 'Operación';

    if (tipo === 'movimientos') {
        campoCuenta.hidden = false;
        inputCuenta.required = true;
        campoMonto.hidden = true;
        inputMonto.required = false;
    } else {
        const necesitaMonto = ['retiro', 'deposito'].includes(tipo);

        campoCuenta.hidden = false;
        inputCuenta.required = true;

        campoMonto.hidden = !necesitaMonto;
        inputMonto.required = necesitaMonto;
    }

    panelOperacion.hidden = false;

    panelOperacion.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function cerrarOperacion() {
    panelOperacion.hidden = true;
    formularioOperacion.reset();
    mensaje.textContent = '';
    operacionActual = '';
}

formularioOperacion.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const cuenta = inputCuenta.value.trim();

    if (!/^[0-9]{1,16}$/.test(cuenta)) {
        mensaje.textContent =
            'Ingresa un número de cuenta válido de hasta 16 dígitos.';
        return;
    }

    if (operacionActual === 'movimientos') {
        mensaje.textContent =
            'La consulta de movimientos estará disponible próximamente.';
        return;
    }

    const datos = { cuenta };

    if (!campoMonto.hidden) {
        const monto = Number(inputMonto.value);

        if (!Number.isFinite(monto) || monto <= 0) {
            mensaje.textContent = 'Ingresa un importe mayor que cero.';
            return;
        }

        datos.monto = monto;
    }

    const operaciones = {
        saldo: '/api/atm/saldo',
        retiro: '/api/atm/retirar',
        deposito: '/api/atm/depositar'
    };

    const endpoint = operaciones[operacionActual];

    if (!endpoint) {
        mensaje.textContent = 'Operación no disponible.';
        return;
    }

    mensaje.textContent = 'Enviando solicitud...';

    try {
        const respuesta = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || resultado.success === false) {
            throw new Error(
                resultado.message ||
                resultado.error ||
                'No se pudo procesar la solicitud.'
            );
        }

        // CONSULTA DE SALDO
        if (operacionActual === 'saldo') {
            const cuentaDatos = resultado.cuenta ?? resultado;
            const saldo = obtenerSaldo(cuentaDatos);

            if (saldo === null) {
                console.log('Respuesta de saldo recibida:', resultado);

                mensaje.textContent =
                    'La cuenta se consultó, pero no se encontró el saldo en la respuesta del Banco Central. Revisa la consola del navegador (F12).';

                return;
            }

            mensaje.textContent =
                `Consulta de cuenta realizada correctamente. Saldo disponible: ${formatearDinero(saldo)}`;

            return;
        }

        // RETIRO Y DEPÓSITO
        mensaje.textContent =
            resultado.message ||
            'Solicitud procesada correctamente.';

    } catch (error) {
        mensaje.textContent =
            error.message ||
            'No se pudo conectar con el servidor.';
    }
});

// Busca el saldo en formatos comunes de respuesta.
function obtenerSaldo(datos) {
    if (!datos || typeof datos !== 'object') {
        return null;
    }

    const posiblesSaldos = [
        datos.balance,
        datos.saldo,
        datos.available_balance,
        datos.account?.balance,
        datos.account?.saldo,
        datos.data?.balance,
        datos.data?.saldo,
        datos.data?.account?.balance
    ];

    for (const valor of posiblesSaldos) {
        if (
            valor !== null &&
            valor !== undefined &&
            valor !== '' &&
            Number.isFinite(Number(valor))
        ) {
            return Number(valor);
        }
    }

    return null;
}

function formatearDinero(cantidad) {
    return cantidad.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });
}

function cerrarSesion() {
    window.location.href = '/login.html';
}

fetch('/api/atm/status')
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error('Servicio no disponible');
        }

        return respuesta.json();
    })
    .then(datos => {
        document.getElementById('estadoCajero').textContent =
            datos.success
                ? 'Cajero disponible'
                : 'Servicio no disponible';
    })
    .catch(() => {
        document.getElementById('estadoCajero').textContent =
            'Sin conexión con el servidor';
    });
