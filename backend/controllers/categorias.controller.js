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

// src/controllers/categorias.controller.js

exports.create = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    // 1. Validamos si ya existe
    const existe = await categoriasService.findOne(nombre); 
    
    if (existe) {
      return res.status(400).json({ 
        title: "Categoría duplicada", 
        message: `La categoría "${nombre}" ya existe en el sistema.` 
      });
    }

    // 2. 🔥 LA PIEZA FALTANTE: Llamar al servicio para insertar en SQLite
    // Pasamos el nombre (y descripción vacía por defecto si no viene)
    const nuevaCategoria = await categoriasService.create(nombre, req.body.descripcion || "");

    // 3. Respondemos con la nueva categoría creada y el estado 201
    res.status(201).json(nuevaCategoria); 

  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ 
      title: "Error del servidor", 
      message: "No pudimos guardar la categoría." 
    });
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