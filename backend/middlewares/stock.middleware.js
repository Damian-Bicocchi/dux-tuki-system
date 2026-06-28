const validateStockInput = (req, res, next) => {
  const { nombre, cantidad } = req.body;
  const errors = {};

  if (!nombre || !nombre.trim()) {
    errors.nombre = "El nombre del equipo es obligatorio.";
  }

  if (
    cantidad === undefined ||
    cantidad === null ||
    !Number.isInteger(Number(cantidad)) ||
    Number(cantidad) < 1
  ) {
    errors.cantidad =
      "La cantidad debe ser un número entero y al menos 1.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

module.exports = {
  validateStockInput,
};