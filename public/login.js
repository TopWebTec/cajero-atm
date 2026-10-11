const btnCliente = document.getElementById('btnCliente');
const btnAdministrador = document.getElementById('btnAdministrador');

const formAcceso = document.getElementById('formAcceso');
const tituloAcceso = document.getElementById('tituloAcceso');

const campoCuenta = document.getElementById('campoCuenta');
const campoUsuario = document.getElementById('campoUsuario');

const inputCuenta = document.getElementById('cuenta');
const inputUsuario = document.getElementById('usuario');
//const inputClave = document.getElementById('clave');

const btnRegresar = document.getElementById('btnRegresar');
const mensajeAcceso = document.getElementById('mensajeAcceso');

let tipoAcceso = '';

function seleccionarPerfil(tipo) {
    tipoAcceso = tipo;

    formAcceso.reset();
    mensajeAcceso.textContent = '';
    formAcceso.hidden = false;

    if (tipo === 'cliente') {
        tituloAcceso.textContent = 'Inicio de sesión del cliente';

        campoCuenta.hidden = false;
        campoUsuario.hidden = true;

        inputCuenta.disabled = false;
        inputCuenta.required = true;

        inputUsuario.disabled = true;
        inputUsuario.required = false;

        inputClave.required = false;
        inputClave.placeholder = 'Ingresa tu PIN (opcional)';
    } else {
        tituloAcceso.textContent = 'Inicio de sesión del administrador';

        campoCuenta.hidden = true;
        campoUsuario.hidden = false;

        inputCuenta.disabled = true;
        inputCuenta.required = false;

        inputUsuario.disabled = false;
        inputUsuario.required = true;

        inputClave.required = false;
        inputClave.placeholder = 'Contraseña de administrador';
    }
}

btnCliente.addEventListener('click', () => {
    seleccionarPerfil('cliente');
});

btnAdministrador.addEventListener('click', () => {
    window.location.href = '/administrador.html';
});

btnRegresar.addEventListener('click', () => {
    formAcceso.reset();
    formAcceso.hidden = true;
    mensajeAcceso.textContent = '';
    tipoAcceso = '';

    inputCuenta.disabled = false;
    inputUsuario.disabled = true;
});

formAcceso.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensajeAcceso.textContent = '';

    if (tipoAcceso === 'administrador') {
        // Redirigir al panel de administración del cajero
        window.location.href = '/administrador.html';
        return;
    }

    if (tipoAcceso === 'cliente') {
        const cuenta = inputCuenta.value.trim();

        if (!/^[0-9]{1,16}$/.test(cuenta)) {
            mensajeAcceso.textContent = 'Ingresa un número de cuenta válido de hasta 16 dígitos.';
            return;
        }

        mensajeAcceso.textContent = 'Verificando cuenta en Banco Central...';

        try {
            const respuesta = await fetch('/api/atm/saldo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cuenta })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok || datos.success === false) {
                mensajeAcceso.textContent = datos.message || 'Cuenta no encontrada en el Banco Central.';
                return;
            }

            // Guardar el número de cuenta y redirigir al simulador
            sessionStorage.setItem('cuentaATM', cuenta);
            window.location.href = `/index.html?cuenta=${encodeURIComponent(cuenta)}`;
        } catch (error) {
            mensajeAcceso.textContent = 'Error al comunicar con el servidor del cajero.';
        }
    }
});

// Comprobar estado del nodo ATM
fetch('/api/atm/status')
    .then((respuesta) => respuesta.json())
    .then((datos) => {
        const elementoEstado = document.getElementById('estadoCajero');
        if (elementoEstado) {
            elementoEstado.textContent = datos.success ? 'Cajero disponible' : 'Servicio no disponible';
        }
    })
    .catch(() => {
        const elementoEstado = document.getElementById('estadoCajero');
        if (elementoEstado) {
            elementoEstado.textContent = 'Sin conexión con el servidor';
        }
    });