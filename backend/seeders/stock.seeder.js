const { getDb } = require('../db');

/**
 * Stock inicial de ejemplo: como máximo dos cámaras.
 * Sólo se inserta si la tabla de artículos está vacía, así reiniciar el
 * servidor no duplica registros ni pisa stock ya cargado.
 */
const CAMARAS_SEED = [
  {
    nombre: 'Cámara Sony A7 III',
    descripcion: 'Cámara mirrorless full frame para foto y video.',
    precio_por_dia: 15000,
    stock_total: 1,
    deposito_garantia: 50000,
    categoria: 'Video',
  },
  {
    nombre: 'Cámara Canon EOS R5',
    descripcion: 'Cámara mirrorless full frame con grabación en 8K.',
    precio_por_dia: 18000,
    stock_total: 1,
    deposito_garantia: 60000,
    categoria: 'Video',
  },
];

function getAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function seedStock() {
  const db = getDb();

  const { total } = await getAsync(
    db,
    'SELECT COUNT(*) AS total FROM articulos',
  );

  if (total > 0) {
    console.log('ℹ️ La tabla de artículos ya tiene datos, no se agrega stock de ejemplo');
    return;
  }

  for (const camara of CAMARAS_SEED) {
    const categoria = await getAsync(
      db,
      'SELECT id FROM categorias WHERE nombre = ?',
      [camara.categoria],
    );

    await runAsync(
      db,
      `INSERT INTO articulos
         (nombre, descripcion, precio_por_dia, stock_total, categoria_id, deposito_garantia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        camara.nombre,
        camara.descripcion,
        camara.precio_por_dia,
        camara.stock_total,
        categoria ? categoria.id : null,
        camara.deposito_garantia,
      ],
    );

    console.log(`✅ Artículo "${camara.nombre}" creado con éxito`);
  }
}

module.exports = { seedStock, CAMARAS_SEED };
