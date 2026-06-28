const { StockRepository } = require("../repositories/stock.repository.js");

class StockService {
  constructor(stockRepository) {
    this.stockRepository = stockRepository;
  }

  normalizar(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  async verificarDuplicado(nombre) {
    if (!nombre.trim()) return null;

    const query = this.normalizar(nombre);
    const items = await this.stockRepository.getAll();

    // Verificar coincidencia exacta
    const exacto = items.find(
      (i) => this.normalizar(i.nombre) === query
    );

    if (exacto) {
      return {
        tipo: "exacto",
        item: exacto,
      };
    }

    // Verificar coincidencias similares
    const similares = items
      .filter((i) => {
        const n = this.normalizar(i.nombre);

        return (
          n.includes(query) ||
          query.includes(n) ||
          n.split(" ").some(
            (w) => w.length > 3 && query.includes(w)
          )
        );
      })
      .map((i) => i.nombre);

    if (similares.length > 0) {
      return {
        tipo: "similares",
        nombres: similares,
      };
    }

    return null;
  }

  async procesarIngresoStock(nombre, categoria, cantidad) {
    const duplicado = await this.verificarDuplicado(nombre);

    if (duplicado && duplicado.tipo === "exacto") {
      const actualizado = await this.stockRepository.updateStock(
        duplicado.item.nombre,
        cantidad
      );

      return {
        operacion: "actualizado",
        item: actualizado,
      };
    }

    const nuevoItem = await this.stockRepository.create({
      nombre: nombre.trim(),
      categoria: categoria || "Otros",
      total: cantidad,
      disponibles: cantidad,
    });

    return {
      operacion: "creado",
      item: nuevoItem,
    };
  }
}

module.exports = {
  StockService,
};