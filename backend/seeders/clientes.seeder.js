const { getDb } = require('../db');

/**
 * Cliente inicial de ejemplo: como máximo un cliente.
 * Sólo se inserta si la tabla de clientes está vacía, así reiniciar el
 * servidor no duplica registros ni pisa clientes ya cargados.
 */
const CLIENTES_SEED = [
  {
    nombre: 'María González',
    email: 'maria.gonzalez@example.com',
    dni: '30123456',
    telefono: '+5491145678901',
    notas: 'Cliente de ejemplo',
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

async function seedClientes() {
  const db = getDb();

  const { total } = await getAsync(
    db,
    'SELECT COUNT(*) AS total FROM clientes',
  );

  if (total > 0) {
    console.log('ℹ️ La tabla de clientes ya tiene datos, no se agrega el cliente de ejemplo');
    return;
  }

  for (const cliente of CLIENTES_SEED) {
    await runAsync(
      db,
      `INSERT INTO clientes (nombre, email, dni, telefono, notas)
       VALUES (?, ?, ?, ?, ?)`,
      [
        cliente.nombre,
        cliente.email,
        cliente.dni,
        cliente.telefono,
        cliente.notas,
      ],
    );

    console.log(`✅ Cliente "${cliente.nombre}" creado con éxito`);
  }
}

module.exports = { seedClientes, CLIENTES_SEED };
