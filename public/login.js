
const btnCliente = document.getElementById('btnCliente');
const btnAdministrador = document.getElementById('btnAdministrador');

const formAcceso = document.getElementById('formAcceso');
const tituloAcceso = document.getElementById('tituloAcceso');

const campoCuenta = document.getElementById('campoCuenta');
const campoUsuario = document.getElementById('campoUsuario');

const inputCuenta = document.getElementById('cuenta');
const inputUsuario = document.getElementById('usuario');
const inputClave = document.getElementById('clave');

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

        inputClave.placeholder = 'Ingresa tu PIN';
    } else {
        tituloAcceso.textContent = 'Inicio de sesión del administrador';

        campoCuenta.hidden = true;
        campoUsuario.hidden = false;

        inputCuenta.disabled = true;
        inputCuenta.required = false;

        inputUsuario.disabled = false;
        inputUsuario.required = true;

        inputClave.placeholder = 'Ingresa tu contraseña';
    }
}

btnCliente.addEventListener('click', () => {
    seleccionarPerfil('cliente');
});

btnAdministrador.addEventListener('click', () => {
    seleccionarPerfil('administrador');
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

    if (tipoAcceso === 'cliente') {
        const cuenta = inputCuenta.value.trim();

        if (!/^[0-9]{1,16}$/.test(cuenta)) {
            mensajeAcceso.textContent =
                'Ingresa un número de cuenta válido.';
            return;
        }
    }

    if (tipoAcceso === 'administrador') {
        const usuario = inputUsuario.value.trim();

        if (!usuario) {
            mensajeAcceso.textContent =
                'Ingresa el usuario administrador.';
            return;
        }
    }

    mensajeAcceso.textContent =
        'El inicio de sesión estará disponible cuando conectemos ' +
        'la autenticación con el servidor.';
});


fetch('/api/atm/status')
    .then((respuesta) => {
        if (!respuesta.ok) {
            throw new Error('Servicio no disponible');
        }

        return respuesta.json();
    })
    .then((datos) => {
        document.getElementById('estadoCajero').textContent =
            datos.success
                ? 'Cajero disponible'
                : 'Servicio no disponible';
    })
    .catch(() => {
        document.getElementById('estadoCajero').textContent =
            'Sin conexión con el servidor';
    });
