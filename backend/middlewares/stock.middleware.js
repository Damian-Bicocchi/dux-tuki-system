function validarNuevoArticulo(req, res, next) {
  const {
    nombre,
    cantidad,
    categoria,
    precio_por_dia,
    deposito_garantia,
  } = req.body;

  const errors = {};

  if (!nombre || !nombre.trim()) {
    errors.nombre = "El nombre es obligatorio.";
  }

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    errors.cantidad = "La cantidad debe ser un número entero positivo.";
  }

  if (
    precio_por_dia === undefined ||
    precio_por_dia === null ||
    isNaN(precio_por_dia) ||
    Number(precio_por_dia) <= 0
  ) {
    errors.precio_por_dia =
      "El precio por día debe ser un número positivo.";
  }

  if (
    deposito_garantia !== undefined &&
    deposito_garantia !== null &&
    deposito_garantia !== "" &&
    (isNaN(deposito_garantia) || Number(deposito_garantia) < 0)
  ) {
    errors.deposito_garantia =
      "El depósito de garantía debe ser un número positivo.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: "error",
      errors,
    });
  }

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