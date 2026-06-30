// routes/alquileres.js
const express = require('express');
const router = express.Router();
const alquilerController = require('../controllers/alquiler.controller');
const alquilerMiddleware = require('../middlewares/alquiler.middleware');

// Listar todos los alquileres
router.get('/', alquilerController.listar);

// Historial específico de alquileres vinculados a un artículo (Soporte para StockDetallePage.tsx)
router.get('/articulo/:id', alquilerController.obtenerAlquileresPorArticulo);

// Obtener un alquiler por ID completo
router.get('/:id', alquilerController.obtenerPorId);

// Crear alquiler
router.post('/', alquilerMiddleware.validarEstructuraCrearOEditar, alquilerController.crear);

// Actualizar alquiler completo
router.put('/:id', alquilerMiddleware.validarEstructuraCrearOEditar, alquilerController.actualizar);

// Modificar solo el estado del alquiler
router.patch('/:id/estado', alquilerMiddleware.validarCambioEstado, alquilerController.parchearEstado);

// Eliminar alquiler (solo devueltos o cancelados)
router.delete('/:id', alquilerController.eliminar);

module.exports = router;