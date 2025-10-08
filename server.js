// El modulo de express nos permitira crear servidores web
// manejar solicitudes HTTP, y responder a los clientes que se conecten al servidor

//------------------------- LIBRERIAS/MODULOS---------------------------------
const express = require('express'); //Importamos el modulo de express
const app = express();
const session = require('express-session'); //Importamos el modulo de express-session
const flash = require('connect-flash'); // Importamos el modulo de connect-flash
const passport = require('passport'); // Importamos Passport (necesario para inicializar)
require('dotenv').config();
const { create } = require('express-handlebars');
require('./config/passport'); // Ejecuta la configuración de la estrategia local

// 🚨 Importamos la lógica de conexión y sincronización de DB
const { con_sequelize, ensureDatabase } = require('./database/connection_mysql_db');


//-------------------------- HANDLEBARS --------------------------------------
// Main sera mi plantilla base y usara la vista home

const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts',
    // 💡 SOLUCIÓN al error de partials: Aseguramos la ruta
    partialsDir: 'views/partials', 
    helpers: { 
        eq: function (a, b) {
            return a === b;
        }
    }
});


//-------------------------- MIDDLEWARES -------------------------------------

// 1. Configuración de Handlebars (Motor de plantillas)
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

// 2. Body Parser (para leer datos del formulario en req.body)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Configuración de Sesiones (Necesario para Passport y Flash)
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave_secreta_segura', // Usar una variable de entorno segura
    resave: false,
    saveUninitialized: false
}));

// 4. Inicializar Passport y Sesiones de Passport
app.use(passport.initialize());
app.use(passport.session());

// 5. Middleware de Mensajes Flash (debe ir DESPUÉS de la sesión)
app.use(flash()); 

// 6. Middleware para hacer accesibles los mensajes flash y el usuario a las vistas (res.locals)
app.use((req, res, next) => {
    // Estas variables son las que se usan en el controlador y en el partial 'messages.hbs'
    res.locals.varMensaje = req.flash('varMensaje');
    res.locals.varEstiloMensaje = req.flash('varEstiloMensaje');
    res.locals.user = req.user || null; // El usuario logueado
    next();
});


// ------------------------ IMPORTACION Y USO DE RUTAS -------------------------
const indexRoutes = require('./routes/routes'); 
app.use('/', indexRoutes); // Conecta las rutas a la URL raíz


// ----------------------- INICIO Y SINCRONIZACIÓN DE DB -----------------------

// Función asíncrona para asegurar la DB y luego iniciar el servidor
const startServer = async () => {
    try {
        // 1. Asegurar que la Base de Datos exista (CREATE DATABASE IF NOT EXISTS)
        await ensureDatabase(); 

        // 2. Sincronizar modelos con la DB (Crea la tabla 'usuarios' si no existe)
        // { alter: true } modifica la tabla sin borrar datos si cambias el modelo
        await con_sequelize.sync({ alter: true }); 
        
        console.log("Base de datos y tablas sincronizadas correctamente.");

        // 3. Iniciar el servidor de Express SÓLO si la DB está lista
        app.listen(process.env.PORT, () => {
            console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("🚫 Error fatal al iniciar la aplicación o DB:", error);
    }
};

startServer(); // Llamamos a la función para arrancar todo

