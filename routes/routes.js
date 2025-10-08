//////////////////////////ARCHIVO DE RUTAS PRINCIPAL////////////////////////////////

/*
Este código define un módulo de enrutamiento para una aplicación Node.js/Express, 
y su propósito principal es manejar la lógica de la página de inicio o dashboard, 
aplicando un control de acceso básico basado en la autenticación del usuario.
*/

const express = require('express');
const router = express.Router();

// Carga las rutas de AUTENTICACIÓN/USUARIO
router.use('/', require('./userRoutes')); 


// Ruta de prueba
// Indica que este código se ejecutará cuando se reciba una petición GET a la ruta raíz (/)
// Es la función manejadora, que recibe el objeto de la petición (req) 
// y el objeto de la respuesta (res).
router.get('/', (req, res) => {
    // Si hay un usuario logueado, redirige al menú principal, sino al login
    if (req.user) {
        // En el futuro, renderizarás la vista del menú principal (ej: /catalogo)
        res.render('home', {
            layout: 'main',
            titulo: 'Bienvenido',
            nombreUsuario: req.user.nombre
        });
    } else {
        // Redirige al login si no está autenticado
        res.redirect('/login');
    }
});

// Aquí irán las rutas del Usuario (Login/Registro)
// router.use('/', require('./usuarioRoutes')); 


//  hace que la instancia del router esté disponible para ser utilizada 
// en el archivo principal de la aplicación
module.exports = router;