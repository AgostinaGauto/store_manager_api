/*
Este código define un middleware de Express llamado verificarAutenticacion
(o similar, a menudo se encuentra en un archivo de middlewares o en el controlador)
que se utiliza para proteger rutas dentro de tu aplicación.
Su función principal es asegurar que solo los usuarios que han iniciado sesión 
puedan acceder a la ruta solicitada. 
Si el usuario no está autenticado, se le deniega el acceso y se le redirige a la página de 
inicio de sesión.
*/

// Middleware para verificar si el usuario está autenticado
exports.verificarAutenticacion = (req, res, next) => {
    // req.isAuthenticated() es un método proporcionado por Passport
    if (req.isAuthenticated()) {
        // Si está autenticado, permite continuar a la siguiente función
        return next();
    }
    
    // Si NO está autenticado, lo redirigimos al login con un mensaje
    req.flash('varEstiloMensaje', 'alert-warning');
    req.flash('varMensaje', 'Debes iniciar sesión para acceder a esta sección.');
    res.redirect('/login');
};