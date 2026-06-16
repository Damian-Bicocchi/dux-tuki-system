const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/env');

let db = null;

function connect() {
  if (db) return db;
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) throw new Error(`Error conectando a BD: ${err.message}`);
    console.log('✅ Conectado a BD SQLite');
    db.run('PRAGMA foreign_keys = ON');
  });
  return db;
}

function getDb() {
  if (!db) throw new Error('BD no conectada, llama a connect() primero');
  return db;
}

module.exports = { connect, getDb };