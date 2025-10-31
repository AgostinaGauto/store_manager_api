// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Middleware de autenticación: Es crucial que solo usuarios logueados accedan a sus pedidos
const isAuthenticated = (req, res, next) => {
    // Usamos el método que asumo que tienes para verificar la sesión/autenticación
    if (req.isAuthenticated()) {
        return next();
    }
    // Asumiendo que usas connect-flash para mensajes
    req.flash('varMensaje', 'Debe iniciar sesión para ver sus pedidos.');
    req.flash('varEstiloMensaje', 'alert-danger');
    res.redirect('/login');
};

// 1. Ruta GET para mostrar el historial de pedidos
router.get('/pedidos', isAuthenticated, orderController.viewOrders);

// 2. RUTA AÑADIDA: Ruta GET para ver el detalle de un pedido específico
// Captura el ID del pedido usando el parámetro dinámico ':id'
router.get('/pedidos/:id', isAuthenticated, orderController.viewOrderDetail);

module.exports = router;