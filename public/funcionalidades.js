
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
            'La consulta de movimientos estará disponible cuando se conecte banco-central.';
        return;
    }

    const datos = { cuenta };

    if (!campoMonto.hidden) {
        const monto = Number(inputMonto.value);

        if (!Number.isFinite(monto) || monto <= 0) {
            mensaje.textContent =
                'Ingresa un importe mayor que cero.';
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

        if (!respuesta.ok) {
            throw new Error(
                resultado.message ||
                'No se pudo procesar la solicitud.'
            );
        }

        mensaje.textContent =
            resultado.message ||
            'Solicitud procesada correctamente.';
    } catch (error) {
        mensaje.textContent =
            error.message ||
            'No se pudo conectar con el servidor.';
    }
});


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
