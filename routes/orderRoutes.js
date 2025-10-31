// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 🚨 Middleware de autenticación: Es crucial que solo usuarios logueados accedan a sus pedidos
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { // o el método que uses para verificar la sesión/autenticación
        return next();
    }
    req.flash('varMensaje', 'Debe iniciar sesión para ver sus pedidos.');
    req.flash('varEstiloMensaje', 'alert-danger');
    res.redirect('/login');
};

// Ruta GET para mostrar el historial de pedidos
router.get('/pedidos', isAuthenticated, orderController.viewOrders);

module.exports = router;
