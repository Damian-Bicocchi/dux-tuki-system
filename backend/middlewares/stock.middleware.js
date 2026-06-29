function validarNuevoArticulo(req, res, next) {
  const { nombre, cantidad, categoria } = req.body;
  const errors = {};

  if (!nombre || !nombre.trim()) {
    errors.nombre = "El nombre del equipo es obligatorio.";
  }

  const parsedCantidad = parseInt(cantidad, 10);
  if (isNaN(parsedCantidad) || parsedCantidad < 1) {
    errors.cantidad = "La cantidad debe ser al menos 1.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      status: "fail", 
      message: "Errores de validación de datos", 
      errors 
    });
  }

  req.body.nombre = nombre.trim();
  req.body.cantidad = parsedCantidad;
  req.body.categoria = categoria && categoria.trim() ? categoria.trim() : "Otros";

  next();
}

const validarIdArticulo = (req, res, next) => {
  const { id } = req.params;
  const idNumerico = Number(id);

  // Validar que el ID sea un número entero positivo válido
  if (!id || isNaN(idNumerico) || idNumerico <= 0 || !Number.isInteger(idNumerico)) {
    return res.status(400).json({ 
      error: "El parámetro ID provisto no es válido. Debe ser un número entero positivo." 
    });
  }

  // Sanitización: Convertimos el parámetro de String a Number para que el resto de capas lo reciba limpio
  req.params.id = idNumerico;
  
  next(); // Criterio de validación aprobado, continúa al controlador
};

module.exports = { validarNuevoArticulo, validarIdArticulo };