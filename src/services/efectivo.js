
let efectivoDisponible = 10000;

function consultarEfectivo() {
    return efectivoDisponible;
}

function agregarEfectivo(cantidad) {
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor que cero.');
    }

    efectivoDisponible += cantidad;
    return efectivoDisponible;
}

function retirarEfectivo(cantidad) {
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor que cero.');
    }

    if (cantidad > efectivoDisponible) {
        throw new Error('El cajero no tiene suficiente efectivo.');
    }

    efectivoDisponible -= cantidad;
    return efectivoDisponible;
}

module.exports = {
    consultarEfectivo,
    agregarEfectivo,
    retirarEfectivo
};
