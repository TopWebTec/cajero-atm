
const efectivoDisponible = document.getElementById('efectivoDisponible');
const estadoCajero = document.getElementById('estadoCajero');
const detalleEstado = document.getElementById('detalleEstado');
const formAbastecer = document.getElementById('formAbastecer');
const inputCantidad = document.getElementById('cantidad');
const mensajeAdmin = document.getElementById('mensajeAdmin');
const btnActualizar = document.getElementById('btnActualizar');


async function consultarEfectivo() {
    try {
        const respuesta = await fetch('/api/atm/efectivo');

        if (!respuesta.ok) {
            throw new Error('No se pudo consultar el efectivo.');
        }

        const datos = await respuesta.json();

        efectivoDisponible.textContent =
            Number(datos.efectivoDisponible).toLocaleString('es-MX', {
                style: 'currency',
                currency: 'MXN'
            });
    } catch (error) {
        efectivoDisponible.textContent = 'No disponible';
        mensajeAdmin.textContent = error.message;
    }
}


async function consultarEstado() {
    try {
        const respuesta = await fetch('/api/atm/status');

        if (!respuesta.ok) {
            throw new Error('No se pudo consultar el estado.');
        }

        const datos = await respuesta.json();

        if (datos.success) {
            estadoCajero.textContent = 'Cajero disponible';
            detalleEstado.textContent = 'En línea';
        } else {
            estadoCajero.textContent = 'Servicio no disponible';
            detalleEstado.textContent = 'No disponible';
        }
    } catch (error) {
        estadoCajero.textContent = 'Sin conexión';
        detalleEstado.textContent = 'No se pudo consultar el servidor';
    }
}


async function actualizarPanel() {
    mensajeAdmin.textContent = '';

    await Promise.all([
        consultarEfectivo(),
        consultarEstado()
    ]);
}


formAbastecer.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const cantidad = Number(inputCantidad.value);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        mensajeAdmin.textContent =
            'Ingresa una cantidad mayor que cero.';
        return;
    }

    mensajeAdmin.textContent = 'Registrando el abastecimiento...';

    try {
        const respuesta = await fetch('/api/atm/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cantidad })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.success) {
            throw new Error(
                datos.message || 'No se pudo agregar el efectivo.'
            );
        }

        mensajeAdmin.textContent =
            'Efectivo agregado correctamente.';

        formAbastecer.reset();

        await consultarEfectivo();
    } catch (error) {
        mensajeAdmin.textContent =
            error.message || 'Error al conectar con el servidor.';
    }
});


btnActualizar.addEventListener('click', actualizarPanel);

actualizarPanel();
