const categoriasService = require('../services/categorias.service');

exports.getAll = async (req, res, next) => {
  try {
    const categorias = await categoriasService.getAll();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const categoria = await categoriasService.getById(parseInt(req.params.id));
    res.json(categoria);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const nuevaCategoria = await categoriasService.create(nombre, descripcion);
    res.status(201).json(nuevaCategoria);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, descripcion } = req.body;
    const categoriaActualizada = await categoriasService.update(id, nombre, descripcion);
    res.json(categoriaActualizada);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const resultado = await categoriasService.delete(id);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};