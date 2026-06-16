const bcrypt = require('bcrypt');
const { getDb } = require('../db');
const { ADMIN_USERNAME, ADMIN_PASSWORD, SALT_ROUNDS } = require('../config/env');

async function createAdmin() {
  const db = getDb();
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM usuarios WHERE username = ?', [ADMIN_USERNAME], (err, row) => {
      if (err) return reject(err);
      if (!row) {
        db.run('INSERT INTO usuarios (username, password) VALUES (?, ?)', [ADMIN_USERNAME, hashedPassword], function(err) {
          if (err) return reject(err);
          console.log('✅ Usuario admin creado con éxito');
          resolve();
        });
      } else {
        console.log('ℹ️ Usuario admin ya existe');
        resolve();
      }
    });
  });
}

module.exports = { createAdmin };