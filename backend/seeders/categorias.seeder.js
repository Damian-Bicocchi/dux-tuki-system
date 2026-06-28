const { getDb } = require('../db');
function seedCategorias() {
  const categorias = [
    {
      nombre: "Audio",
      descripcion: "Micrófonos, parlantes y consolas.",
    },
    {
      nombre: "Iluminación",
      descripcion: "Reflectores, luces LED y efectos.",
    },
    {
      nombre: "Video",
      descripcion: "Proyectores, pantallas y cámaras.",
    },
    {
      nombre: "Escenario",
      descripcion: "Tarimas, estructuras y accesorios.",
    },
    {
      nombre: "Cables",
      descripcion: "Cables de alimentación, audio y video.",
    },
    {
      nombre: "Accesorios",
      descripcion: "Trípodes, soportes y adaptadores.",
    },
  ];
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO categorias (nombre, descripcion)
    VALUES (?, ?)
  `);

  categorias.forEach((categoria) => {
    stmt.run(categoria.nombre, categoria.descripcion);
  });

  stmt.finalize();
}

module.exports = {
  seedCategorias,
};