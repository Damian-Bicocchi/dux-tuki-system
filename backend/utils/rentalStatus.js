const ESTADOS_ALQUILER = [
    'pendiente',
    'activo',
    'vencido',
    'devuelto',
    'cancelado',
];

function fechaHoyLocal() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

/**
 * Estado efectivo de un alquiler: un alquiler pendiente o activo cuya
 * fecha_fin ya pasó se considera vencido. Devuelto y cancelado no cambian.
 */
function estadoEfectivoAlquiler(row, hoy = fechaHoyLocal()) {
    if (!row) return row;

    const estado = row.estado;
    const fechaFin = row.fecha_fin || row.fechaFin;

    if (estado === 'devuelto' || estado === 'cancelado') {
        return estado;
    }

    if (fechaFin && fechaFin < hoy) {
        return 'vencido';
    }

    return estado;
}

module.exports = {
    ESTADOS_ALQUILER,
    fechaHoyLocal,
    estadoEfectivoAlquiler,
};
