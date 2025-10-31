// server.js

//------------------------- LIBRERIAS/MODULOS---------------------------------
const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config();
// 🚨 CORRECCIÓN: Importamos los helpers utilitarios con otro nombre para evitar conflicto
const helpers_util = require('handlebars-helpers')();
const { create } = require('express-handlebars');
require('./config/passport');
// Importamos la función setupAssociations para ejecutarla
const setupAssociations = require('./models/associations'); // <--- CAMBIO CLAVE: Importamos la función
// 🚨 Importamos la lógica de conexión y sincronización de DB
const { con_sequelize, ensureDatabase } = require('./database/connection_mysql_db');


//-------------------------- HANDLEBARS --------------------------------------

const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials',

    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },

    // 🚨 CLAVE: Fusionamos todos los helpers instalados con los custom
    helpers: {
        ...helpers_util, // Incluye todos los helpers
        
        // Mantenemos el custom 'eq' si quieres sobreescribir el comportamiento
        eq: function (a, b) {
            return a === b;
        },

        Acceso: function (rolUsuario, nivelRequerido, options) {
            if (!options || typeof options.fn !== 'function') {
                return '';
            }

            const rol = parseInt(rolUsuario);
            const requerido = parseInt(nivelRequerido);

            if (rol >= requerido) {
                return options.fn(this);
            }

            // Solo llama a options.inverse si existe
            if (options.inverse && typeof options.inverse === 'function') {
                return options.inverse(this);
            }
            return '';
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
    secret: process.env.SESSION_SECRET || 'clave_secreta_segura',
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
    res.locals.varMensaje = req.flash('varMensaje');
    res.locals.varEstiloMensaje = req.flash('varEstiloMensaje');
    res.locals.user = req.user || null;
    next();
});

// Middleware para servir archivos estáticos (Assets)
app.use(express.static(__dirname + "/assets"));

app.use(express.static(path.join(__dirname, 'public')));


// ------------------------ IMPORTACION Y USO DE RUTAS -------------------------
// NOTA IMPORTANTE: Se asume que todas las rutas no específicas (Carrito, Auth) están en indexRoutes.
const indexRoutes = require('./routes/routes');

// Se importa SÓLO la nueva ruta de Pedidos, que es lo que necesitamos.
const orderRoutes = require('./routes/orderRoutes'); 

app.use('/', indexRoutes); 
app.use('/', orderRoutes); // Registro de rutas de Pedidos


// ----------------------- INICIO Y SINCRONIZACIÓN DE DB -----------------------

const startServer = async () => {
    try {
        await ensureDatabase();

        // 🚨 EJECUTAR ASOCIACIONES ANTES DE LA SINCRONIZACIÓN 🚨
        setupAssociations(); // <--- Nueva línea para configurar las relaciones

        // Sincronizar la DB: alter: true actualiza las claves foráneas si es necesario
        await con_sequelize.sync({ alter: true }); 

        console.log("Base de datos y tablas sincronizadas correctamente.");

        app.listen(process.env.PORT, () => {
            console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("Error fatal al iniciar la aplicación o DB:", error);
    }
};

startServer();