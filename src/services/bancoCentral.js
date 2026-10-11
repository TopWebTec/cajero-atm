async function solicitarBancoCentral(endpoint, opciones = {}) {
    const baseURL = process.env.CENTRAL_API_URL;
    // Soporta indistintamente cualquier nombre que le hayan dado a la variable
    const apiKey = process.env.ATM_API_KEY || process.env.SUCURSAL_API_KEY || process.env.CENTRAL_API_KEY;

    if (!baseURL) {
        throw new Error('Falta configurar CENTRAL_API_URL en el archivo .env');
    }

    if (!apiKey) {
        throw new Error('Falta configurar ATM_API_KEY en el archivo .env');
    }

    if (typeof endpoint !== 'string' || !endpoint.trim()) {
        throw new Error('Debes proporcionar un endpoint válido.');
    }

    const urlBase = baseURL.replace(/\/+$/, '');
    const ruta = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${urlBase}${ruta}`;

    const headers = {
        Accept: 'application/json',
        'X-API-Key': apiKey,
        ...opciones.headers
    };

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