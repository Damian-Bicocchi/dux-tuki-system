const categoriasRepository = require('../repositories/categorias.repository');

class CategoriasService {
  async getAll() {
    return await categoriasRepository.findAll();
  }

  async getById(id) {
    const categoria = await categoriasRepository.findById(id);
    if (!categoria) {
      const error = new Error('Categoría no encontrada');
      error.status = 404;
      throw error;
    }
    return categoria;
  }

  async create(nombre, descripcion) {
    if (!nombre || nombre.trim() === '') {
      const error = new Error('El nombre es obligatorio');
      error.status = 400;
      throw error;
    }
    try {
      const result = await categoriasRepository.create(nombre, descripcion);
      return await this.getById(result.id);
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        const error = new Error('Ya existe una categoría con ese nombre');
        error.status = 409;
        throw error;
      }
      throw err;
    }
  }

  async update(id, nombre, descripcion) {
    if (!nombre || nombre.trim() === '') {
      const error = new Error('El nombre es obligatorio');
      error.status = 400;
      throw error;
    }
    const { changes } = await categoriasRepository.update(id, nombre, descripcion);
    if (changes === 0) {
      const error = new Error('Categoría no encontrada');
      error.status = 404;
      throw error;
    }
    return await this.getById(id);
  }

  async delete(id) {
    const { changes } = await categoriasRepository.delete(id);
    if (changes === 0) {
      const error = new Error('Categoría no encontrada');
      error.status = 404;
      throw error;
    }
    return { message: 'Categoría eliminada correctamente' };
  }

  async findOne(nombre){
    console.log("que tal estoy buscand una categoria con nombre:", nombre);
    
    // CORRECCIÓN: Llamamos a findByName (que definiremos abajo en el repo)
    const categoriaMismoNombre = await categoriasRepository.findByName(nombre);
    
    console.log("ya busque una categoria, fue ", categoriaMismoNombre);
    
    // CORRECCIÓN LÓGICA: Si es diferente de null/undefined, significa que SÍ existe.
    return categoriaMismoNombre !== undefined && categoriaMismoNombre !== null;
  }
}

module.exports = new CategoriasService();