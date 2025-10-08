/* Este código define un Modelo de Sequelize llamado Usuario,
 que representa la tabla de usuarios en la base de datos. 
 Lo más notable es que incorpora lógica de seguridad para el manejo de contraseñas 
 mediante hashing con bcryptjs, utilizando hooks y métodos de instancia.

*/


// Importamos el objeto DataTypes que sirve para definir los tipos
// de datos de las columnas. Ejemplo: INTEGER, STRING, etc.
const { DataTypes } = require('sequelize');

// Importamos la instancia de conexion a la Base de Datos
// Que fue definida en el archivo de la conexion a la BD
// Todos los modelos de sequelize deben estar asociados a una 
// conexion
const { con_sequelize } = require('../database/connection_mysql_db');

// Importamos la libreria bcryptjs para hashear las contraseñas
const bcrypt = require('bcryptjs'); // Necesitas instalar bcryptjs: npm install bcryptjs


// Definimos el modelo de usuario con sus atributos
const Usuario = con_sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // El email debe ser único para el login
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    // Hooks de Sequelize para hashear la contraseña antes de guardar/actualizar
    /* 
    Los hooks son funciones que se ejecutan automáticamente en ciertos momentos del 
    ciclo de vida de un modelo (ej: antes de guardar, después de eliminar).

    El objetivo aquí es siempre hashear la contraseña antes de que el registro llegue 
    a la base de datos, para nunca almacenar texto plano.

    */
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.password) {
                const salt = await bcrypt.genSalt(10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        },

        beforeUpdate: async (usuario) => {
            if (usuario.password && usuario.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        }
    }
});

// Método personalizado para verificar la contraseña

/*
Se agrega un método de instancia (validarPassword) al prototipo del modelo Usuario. 
Esto significa que cada objeto Usuario recuperado de la base de datos
 tendrá este método disponible.

*/
Usuario.prototype.validarPassword = function (password) {
    // Compara el hash de la DB (this.password) con la password ingresada
    return bcrypt.compareSync(password, this.password);
};


/*

El modelo Usuario es exportado para que pueda ser importado 
y usado en el resto de la aplicación (ej: en controladores y rutas) 
para realizar operaciones CRUD (Crear, Leer, Actualizar, Borrar).

*/

module.exports = Usuario;