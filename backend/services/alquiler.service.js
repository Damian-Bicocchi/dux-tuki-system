// services/alquiler.service.js
const alquilerRepository = require("../repositories/alquiler.repository");

class AlquilerService {
  // Helpers internos heredados de tu archivo original
  _calcularDias(fecha_inicio, fecha_fin) {
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    return diff < 1 ? 1 : diff;
  }

  _calcularPrecioTotal(items, dias) {
    return items.reduce(
      (acc, item) => acc + item.precio_unitario_dia * item.cantidad * dias,
      0
    );
  }

  async _verificarDisponibilidad(articulo_id, cantidad, fecha_inicio, fecha_fin, excluir_alquiler_id = null) {
    const articulo = await alquilerRepository.getStockTotalArticulo(articulo_id);
    if (!articulo) {
      throw new Error(`Artículo ${articulo_id} no encontrado`);
    }
    const ocupadas = await alquilerRepository.getCantidadOcupada(articulo_id, fecha_inicio, fecha_fin, excluir_alquiler_id);
    const disponibles = articulo.stock_total - ocupadas;

    if (disponibles < cantidad) {
      throw new Error(
        `Stock insuficiente para artículo ${articulo_id}: disponibles ${disponibles}, solicitados ${cantidad}`
      );
    }
    return true;
  }

  // Métodos de Servicio expuestos
  async listarAlquileres(filtros) {
    return await alquilerRepository.listarAlquileresFiltrados(filtros);
  }

  async obtenerAlquilerCompleto(id) {
    const alquiler = await alquilerRepository.getAlquilerBase(id);
    if (!alquiler) return null;
    
    const items = await alquilerRepository.getItemsDelAlquiler(id);
    return { ...alquiler, items };
  }

  async crearAlquiler(data) {
    const { cliente_id, fecha_inicio, fecha_fin, estado, notas, items } = data;
    const dias = this._calcularDias(fecha_inicio, fecha_fin);

    // 1. Verificar stock
    for (const item of items) {
      await this._verificarDisponibilidad(item.articulo_id, item.cantidad, fecha_inicio, fecha_fin);
    }

    // 2. Resolver precios unitarios si no vienen definidos
    const itemsConPrecio = await Promise.all(
      items.map(async (item) => {
        const art = await alquilerRepository.getStockTotalArticulo(item.articulo_id);
        return {
          ...item,
          precio_unitario_dia: item.precio_unitario_dia !== undefined ? item.precio_unitario_dia : art.precio_por_dia,
        };
      })
    );

    // 3. Calcular total
    const precio_total = this._calcularPrecioTotal(itemsConPrecio, dias);

    // 4. Persistir Alquiler e Ítems
    const alquiler_id = await alquilerRepository.insertarAlquiler({
      cliente_id, fecha_inicio, fecha_fin, estado, precio_total, notas
    });

    await alquilerRepository.insertarItemsAlquiler(alquiler_id, itemsConPrecio);

    return await this.obtenerAlquilerCompleto(alquiler_id);
  }

  async actualizarAlquilerCompleto(alquiler_id, data) {
    const { cliente_id, fecha_inicio, fecha_fin, estado, notas, items } = data;
    const dias = this._calcularDias(fecha_inicio, fecha_fin);

    // 1. Verificar disponibilidad excluyendo el alquiler actual
    for (const item of items) {
      await this._verificarDisponibilidad(item.articulo_id, item.cantidad, fecha_inicio, fecha_fin, alquiler_id);
    }

    // 2. Resolver precios
    const itemsConPrecio = await Promise.all(
      items.map(async (item) => {
        const art = await alquilerRepository.getStockTotalArticulo(item.articulo_id);
        return {
          ...item,
          precio_unitario_dia: item.precio_unitario_dia !== undefined ? item.precio_unitario_dia : art.precio_por_dia,
        };
      })
    );

    const precio_total = this._calcularPrecioTotal(itemsConPrecio, dias);

    // 3. Ejecutar Update
    const cambios = await alquilerRepository.actualizarAlquiler(alquiler_id, {
      cliente_id, fecha_inicio, fecha_fin, estado, precio_total, notas
    });

    if (cambios === 0) return null;

    // 4. Reemplazar items de forma limpia
    await alquilerRepository.borrarItemsAlquiler(alquiler_id);
    await alquilerRepository.insertarItemsAlquiler(alquiler_id, itemsConPrecio);

    return await this.obtenerAlquilerCompleto(alquiler_id);
  }

  async cambiarEstado(id, estado) {
    const cambios = await alquilerRepository.actualizarEstadoAlquiler(id, estado);
    if (cambios === 0) return null;
    return await this.obtenerAlquilerCompleto(id);
  }

  async eliminarAlquilerSiEsValido(id) {
    const alquiler = await alquilerRepository.getAlquilerBase(id);
    if (!alquiler) return { encontrado: false };

    if (!['cancelado', 'devuelto'].includes(alquiler.estado)) {
      return { encontrado: true, permitido: false };
    }

    await alquilerRepository.eliminarAlquiler(id);
    return { encontrado: true, permitido: true };
  }
  
  // Soporte adaptado para listados reactivos basados en el id de artículo
  async listarAlquileresPorArticulo(articuloId) {
    const hoy = new Date().toISOString().split("T")[0];
    const rows = await alquilerRepository.findAlquileresByArticuloId(articuloId);
    
    return rows.map((row) => {
      let estadoFrontend = "finalizado";
      if (row.estado === "activo") {
        estadoFrontend = row.fecha_fin < hoy ? "vencido" : "activo";
      } else if (row.estado === "pendiente") {
        estadoFrontend = "activo";
      } else if (row.estado === "devuelto" || row.estado === "cancelado") {
        estadoFrontend = "finalizado";
      }

      return {
        id: row.id,
        cliente: row.cliente,
        estado: estadoFrontend,
        fechaInicio: row.fecha_inicio,
        fechaFin: row.fecha_fin,
        precio: row.precio,
      };
    });
  }
}

module.exports = new AlquilerService();