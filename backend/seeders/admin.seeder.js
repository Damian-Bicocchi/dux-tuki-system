const bcrypt = require('bcrypt');
const { getDb } = require('../db');
const { ADMIN_USERNAME, ADMIN_PASSWORD, SALT_ROUNDS } = require('../config/env');

async function createAdmin() {
  const db = getDb();

  // Asegura que SALT_ROUNDS sea un número (por si viene como string en el .env)
  const rounds = Number(SALT_ROUNDS) || 10;
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, rounds);

  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM usuarios WHERE username = ?', [ADMIN_USERNAME], (err, row) => {
      if (err) return reject(err);

      if (!row) {
        // Inserta el usuario admin estableciendo is_admin = 1 y role_id = NULL
        db.run(
          'INSERT INTO usuarios (username, password, is_admin, role_id) VALUES (?, ?, 1, NULL)',
          [ADMIN_USERNAME, hashedPassword],
          function (err) {
            if (err) return reject(err);
            console.log(`✅ Usuario admin maestro (${ADMIN_USERNAME}) creado con éxito`);
            resolve();
          }
        );
      } else {
        console.log(`ℹ️ El usuario admin (${ADMIN_USERNAME}) ya existe en la base de datos`);
        resolve();
      }
    });
  });
}

module.exports = { createAdmin };