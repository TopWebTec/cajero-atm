const BASE_URL = process.env.CENTRAL_API_URL;
const API_KEY = process.env.SUCURSAL_API_KEY;

async function solicitarBancoCentral(endpoint, opciones = {}) {
    if (!BASE_URL) {
        throw new Error(
            'Falta configurar CENTRAL_API_URL en el archivo .env'
        );
    }

    if (!API_KEY) {
        throw new Error(
            'Falta configurar SUCURSAL_API_KEY en el archivo .env'
        );
    }

    if (typeof endpoint !== 'string' || !endpoint.trim()) {
        throw new Error('Debes proporcionar un endpoint válido.');
    }

    if (typeof fetch !== 'function') {
        throw new Error(
            'Se requiere una versión de Node.js que incluya fetch.'
        );
    }

    const urlBase = BASE_URL.replace(/\/+$/, '');
    const ruta = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    const url = `${urlBase}${ruta}`;

    const headers = {
        Accept: 'application/json',
        'X-API-Key': API_KEY,
        ...opciones.headers
    };

    // Agregar Content-Type solamente cuando se envía un cuerpo.
    if (opciones.body !== undefined && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    let respuesta;

    try {
        respuesta = await fetch(url, {
            ...opciones,
            headers
        });
    } catch (error) {
        const errorConexion = new Error(
            `No se pudo conectar con el Banco Central: ${error.message}`
        );

        errorConexion.cause = error;
        throw errorConexion;
    }

    const contenido = await respuesta.text();
    let datos = null;

    if (contenido) {
        try {
            datos = JSON.parse(contenido);
        } catch {
            datos = { message: contenido };
        }
    }

    if (!respuesta.ok) {
        const error = new Error(
            datos?.message ||
            datos?.error ||
            `Error del Banco Central: HTTP ${respuesta.status}`
        );

        error.status = respuesta.status;
        error.data = datos;

        throw error;
    }

    return datos;
}

module.exports = {
    solicitarBancoCentral
};
