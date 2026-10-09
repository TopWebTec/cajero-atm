const BASE_URL = process.env.BANK_CENTRAL_URL;
const API_KEY = process.env.ATM_API_KEY;

async function solicitarBancoCentral(endpoint, opciones = {}) {
    if (!BASE_URL) {
        throw new Error(
            'Falta configurar BANK_CENTRAL_URL en el archivo .env'
        );
    }

    if (!API_KEY) {
        throw new Error(
            'Falta configurar ATM_API_KEY en el archivo .env'
        );
    }

    const urlBase = BASE_URL.replace(/\/+$/, '');
    const ruta = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    const respuesta = await fetch(`${urlBase}${ruta}`, {
        ...opciones,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            ...opciones.headers
        }
    });

    const contenido = await respuesta.text();
    let datos;

    try {
        datos = contenido ? JSON.parse(contenido) : null;
    } catch {
        datos = { message: contenido };
    }

    if (!respuesta.ok) {
        const error = new Error(
            datos?.message ||
            `Error del banco central: HTTP ${respuesta.status}`
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
