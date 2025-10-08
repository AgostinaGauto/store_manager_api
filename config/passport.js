/* Este código es fundamental en cualquier aplicación Node.js que use Passport.js 
para manejar el inicio de sesión. 
Su propósito es configurar la estrategia de autenticación local
(la que usa email/nombre de usuario y contraseña) para que pueda validar 
las credenciales de un usuario contra la base de datos.
*/

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mUsuario = require('../models/userModel'); // Importamos el modelo de usuario

// Definición de la estrategia local (para login con email y contraseña)
passport.use(new LocalStrategy({
    usernameField: 'email', // El campo en el formulario de login que contiene el email
    passwordField: 'password' // El campo en el formulario que contiene la contraseña
},
    async (email, password, done) => {
        try {
            // 1. Buscar el usuario por email
            const usuario = await mUsuario.findOne({ where: { email } });

            if (!usuario) {
                // Si el usuario no existe
                return done(null, false, { message: 'El email no está registrado.' });
            }

            // 2. Verificar la contraseña usando el método definido en el modelo
            const passwordValida = usuario.validarPassword(password);
            
            if (!passwordValida) {
                // Si la contraseña no es válida
                return done(null, false, { message: 'Contraseña incorrecta.' });
            }

            // 3. Autenticación exitosa
            // Devuelve el objeto completo del usuario
            return done(null, usuario);
        } catch (error) {
            return done(error);
        }
    }
));

// ------------------------------------------------------------------
// 💡 MÉTODOS DE SERIALIZACIÓN (SOLUCIÓN AL ERROR DE SESIÓN)
// ------------------------------------------------------------------

// 1. Serializar Usuario (Guardar en Sesión)
passport.serializeUser((usuario, done) => {
    // Solo guardamos el ID del usuario en la sesión.
    done(null, usuario.id);
});

// 2. Deserializar Usuario (Recuperar de Sesión)
passport.deserializeUser(async (id, done) => {
    try {
        // Buscamos el usuario en la DB usando el ID almacenado en la sesión
        const usuario = await mUsuario.findByPk(id); 

        // Si se encuentra, el objeto 'usuario' se adjunta a req.user
        done(null, usuario);
    } catch (err) {
        // Si hay un error, lo pasamos
        done(err);
    }
});