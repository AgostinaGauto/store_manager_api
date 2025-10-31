const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const productoController = require('../controllers/productController');
const { verificarAutenticacion } = require('../middlewares/auth');
const { uploadImagen } = require('../middlewares/multer'); 

// 1. GET: /productos -> Listar todos los productos
router.get('/', verificarAutenticacion, productoController.listarProductos);

// 2. GET: /productos/crear -> Mostrar formulario de creación
router.get('/crear', verificarAutenticacion, productoController.mostrarCrear);

// 3. POST: /productos/crear -> Procesa el formulario de Alta (Crear)
// 🚨 CAMBIO: Usamos una función de manejo de errores de Multer separada para no bloquear la redirección exitosa.
router.post('/crear', verificarAutenticacion, (req, res, next) => {
    uploadImagen(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Error conocido de Multer (ej: tamaño de archivo excedido)
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', `Error al subir imagen: ${err.message}. El límite es de 5MB.`);
            return res.redirect('/productos/crear');
        } 
        if (err) {
            // Otros errores, como los lanzados por fileFilter
            req.flash('varEstiloMensaje', 'alert-danger');
            // Usamos un mensaje genérico si el error no es de Multer (como un rechazo de tipo de archivo)
            req.flash('varMensaje', 'Error al procesar la imagen. Asegúrese de que sea una imagen válida (jpg, png) y no exceda el límite.');
            return res.redirect('/productos/crear');
        }
        // Si no hay errores, pasamos al siguiente middleware (el controlador)
        next();
    });
}, productoController.crearProducto); // <-- Ahora, si next() se llama, este controlador se ejecuta.


// 4. GET: /productos/editar/:id -> Mostrar formulario de edición
router.get('/editar/:id', verificarAutenticacion, productoController.mostrarEditar);

// 5. POST: /productos/editar/:id -> Procesa la Edición
router.post('/editar/:id', verificarAutenticacion, uploadImagen, productoController.actualizarProducto);

// 6. POST: /productos/eliminar/:id -> Procesa la Eliminación
router.post('/eliminar/:id', verificarAutenticacion, productoController.eliminarProducto);

module.exports = router;