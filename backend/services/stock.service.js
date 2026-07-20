const stockRepository = require("../repositories/stock.repository");
const categoriasRepository = require("../repositories/categorias.repository");

function normalizarTexto(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function mapearAFrontend(art) {
  const cantidadAlquilados = Number(art.cantidad_alquilados || 0);
  const disponibles = Math.max(0, Number(art.stock_total || 0) - cantidadAlquilados);

  return {
    id: art.id,
    nombre: art.nombre,
    categoria: art.categoria_nombre || "Otros",
    total: art.stock_total,
    disponibles,
    cantidad_alquilados: cantidadAlquilados,
    precio_por_dia: art.precio_por_dia,
    deposito_garantia: art.deposito_garantia
  };
}

class StockService {
  async listarArticulos() {
    const articulos = await stockRepository.findAll();
    return articulos.map(mapearAFrontend);
  }

  async listarCategorias() {
    return await categoriasRepository.findAll();
  }

  async procesarArticulo(
      nombre,
      cantidad,
      nombreCategoria,
      precioPorDia,
      depositoGarantia
  ) {
    const articulosBD = await stockRepository.findAll();
    const nombreQuery = normalizarTexto(nombre);

    // 1. Validar coincidencia exacta en el stock actual
    const articuloExistente = articulosBD.find(
      (item) => normalizarTexto(item.nombre) === nombreQuery
    );

    if (articuloExistente) {
      const nuevoTotal = articuloExistente.stock_total + cantidad;
      await stockRepository.updateStock(articuloExistente.id, nuevoTotal);

      const actualizado = { ...articuloExistente, stock_total: nuevoTotal };
      return {
        esDuplicado: true,
        message: `Se sumaron ${cantidad} unidades a "${articuloExistente.nombre}".`,
        item: mapearAFrontend(actualizado)
      };
    }

    // 2. Si es un registro nuevo, buscamos la categoría por nombre en el repositorio
    const categoriaEncontrada = await categoriasRepository.findByName(nombreCategoria);
    const categoriaId = categoriaEncontrada ? categoriaEncontrada.id : null;

    // 3. Crear el artículo en SQLite
    const nuevoArticulo = await stockRepository.create({
    nombre,
    stock_total: cantidad,
    categoria_id: categoriaId,
    precio_por_dia: precioPorDia,
    deposito_garantia:
      depositoGarantia === undefined ||
      depositoGarantia === null ||
      depositoGarantia === ""
        ? null
        : depositoGarantia,
  });

    // Añadir el texto de la categoría para el mapeo final del frontend
    nuevoArticulo.categoria_nombre = categoriaEncontrada ? categoriaEncontrada.nombre : "Otros";

    return {
      esDuplicado: false,
      message: `"${nombre}" fue registrado con ${cantidad} unidades en stock.`,
      item: mapearAFrontend(nuevoArticulo)
    };
  }

  async buscarArticuloPorId(id) {
    // El servicio simplemente le pide los datos limpios al repositorio
    return await stockRepository.findArticuloById(id);
  }
}

module.exports = new StockService();