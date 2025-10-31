const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoryController');
const { verificarAutenticacion } = require('../middlewares/auth'); 

// Todas las rutas de gestión de Categorías deben usar el middleware para protegerlas

// GET: /categorias -> Muestra el listado de todas las categorías (Consulta)
router.get('/', verificarAutenticacion, categoriaController.listarCategorias); 

// GET: /categorias/crear -> Muestra el formulario de Alta
router.get('/crear', verificarAutenticacion, categoriaController.mostrarCrear);

// POST: /categorias/crear -> Procesa el formulario de Alta (Crear)
router.post('/crear', verificarAutenticacion, categoriaController.crearCategoria);

// GET: /categorias/editar/:id -> Muestra el formulario de Modificación
router.get('/editar/:id', verificarAutenticacion, categoriaController.mostrarEditar);

// POST: /categorias/editar/:id -> Procesa el formulario de Modificación (Actualizar)
router.post('/editar/:id', verificarAutenticacion, categoriaController.actualizarCategoria);

// POST: /categorias/eliminar/:id -> Procesa la Baja (Eliminar)
router.post('/eliminar/:id', verificarAutenticacion, categoriaController.eliminarCategoria);

module.exports = router;