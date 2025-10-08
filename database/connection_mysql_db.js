
// Importamos el modulo de sequelize 
// Y lo usaremos para crear la instancia de conexion y definir los modelos
const { Sequelize } = require('sequelize');
// Importamos el paquete mysql2 para poder usar asyn/await
// Se utiliza para crear la base de datos si no existe, porque sequelize no puede 
// crear la base de datos por si solo
const mysql = require('mysql2/promise'); // Usamos el driver de MySQL para crear la DB

// Creamos una instancia de la clase sequelize
// Esta instancia representa la conexion ORM con la Base de Datos
const con_sequelize = new Sequelize(
    process.env.DB_NAME,  // Parametros de conexion
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false, // Desactiva la salida de SQL en la consola
        define: {
            // Convierte el nombre de la tabla a snake_case automáticamente (ej: CarroItems -> carro_items)
            underscored: true
        }
    }
);

// 2. Función para asegurar que la base de datos exista
// Esta funcion ayuda a sequelize a crear la base de datos
// ya que no puede hacerlo por si mismo
const ensureDatabase = async () => {
    // Intentamos crear la DB si no existe (Sequelize no lo hace por defecto)
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    
    // Crea la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();
    console.log(`Base de datos '${process.env.DB_NAME}' asegurada.`);
};


// exporta los dos elementos clave para que puedan ser 
// utilizados en otras partes de la aplicación
module.exports = {
    con_sequelize,
    ensureDatabase
};