/*
Este archivo contendrá las rutas necesarias para ver los formularios de 
login/registro y para procesar los datos enviados.
utilizando el sistema de enrutamiento modular de Express y la librería Passport.js
para manejar la lógica de la sesión.
*/

//------------------------- CONFIGURACION E IMPORTACIONES -------------------------
const express = require('express');
const router = express.Router();
// Importamos el controlador que contendrá la lógica de registro
const usuarioController = require('../controllers/userController.js'); 
// Importamos la libreria passport para autenticacion de usuarios
const passport = require('passport');


//------------------------- RUTAS ---------------------------------------
// 1. Ruta para mostrar el formulario de REGISTRO (GET)
// Usaremos un middleware para asegurar que solo usuarios NO autenticados vean esta página

router.get('/registro', (req, res, next) => {
    // Si el usuario ya está autenticado (req.user existe), lo redirigimos al home
    if (req.user) {
        return res.redirect('/');
    }
    // Si no está autenticado, permite que el controlador muestre la vista
    next(); 
}, usuarioController.mostrarRegistro);

// 2. Ruta para procesar el formulario de REGISTRO (POST)
router.post('/registro', usuarioController.registrarUsuario);


// 3. Ruta para mostrar el formulario de LOGIN (GET)
// Usaremos el mismo middleware para evitar que usuarios logueados vean esta página
router.get('/login', (req, res, next) => {
    if (req.user) {
        return res.redirect('/');
    }
    next();
}, usuarioController.mostrarLogin);


// 4. Ruta para procesar el formulario de LOGIN (POST)
// Usamos el middleware de Passport para manejar la autenticación
router.post('/login', passport.authenticate('local', {
    successRedirect: '/', // Redirecciona a la ruta principal si el login es exitoso
    failureRedirect: '/login', // Redirecciona de vuelta al login si falla
    failureFlash: true // Habilita los mensajes flash para errores
}));


// 5. Ruta para CERRAR SESIÓN (LOGOUT)
router.get('/logout', (req, res, next) => {
    // req.logout() es un método de Passport para cerrar la sesión
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

module.exports = router;