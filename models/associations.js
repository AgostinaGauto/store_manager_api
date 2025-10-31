// models/associations.js

// ------------------- IMPORTAR MODELOS -------------------
const Usuario = require('./userModel');
const Categoria = require('./categoryModel');
const Producto = require('./productModel');

// 🚨 IMPORTAR NUEVOS MODELOS DE PEDIDOS 🚨
const Pedido = require('./orderModel');
const DetallePedido = require('./orderDetailModel');

// ------------------- FUNCIÓN DE CONFIGURACIÓN -------------------

const setupAssociations = () => {

    // ------------------- RELACIONES EXISTENTES -------------------

    // Relación 1:N entre Categoria y Producto
    Categoria.hasMany(Producto, {
        foreignKey: {
            name: 'categoriaId',
            allowNull: false
        }
    });
    Producto.belongsTo(Categoria, {
        foreignKey: 'categoriaId'
    });


    // ------------------- NUEVAS RELACIONES DE PEDIDOS -------------------

    // 1. Relación Usuario <-> Pedido (1:N)
    // Un Usuario puede tener muchos Pedidos (1:N)
    Usuario.hasMany(Pedido, {
        foreignKey: {
            name: 'usuarioId',
            allowNull: false
        }
    });
    Pedido.belongsTo(Usuario, {
        foreignKey: 'usuarioId'
    });

    // 2. Relación Pedido <-> DetallePedido (1:N)
    // Esta es la clave para que funcione el 'include' del controlador.
    Pedido.hasMany(DetallePedido, { 
        foreignKey: 'pedidoId',
        // Opcional, pero define el alias para la consulta:
        as: 'DetallePedidos' 
    });
    DetallePedido.belongsTo(Pedido, { 
        foreignKey: 'pedidoId' 
    });
    
    // 3. Relación Producto <-> DetallePedido (1:N)
    // Esta es la clave para que el Detalle sepa qué Producto mostrar.
    Producto.hasMany(DetallePedido, { 
        foreignKey: 'productoId', 
        as: 'detalles_producto'
    });
    DetallePedido.belongsTo(Producto, { 
        foreignKey: 'productoId' 
    });


    // ------------------- RELACIONES N:M (Opcionales si usas las 1:N arriba) -------------------
    /* Si usas las hasMany/belongsTo arriba, las belongsToMany no son estrictamente necesarias
       para la consulta del detalle, pero las dejaré comentadas para referencia.
    Pedido.belongsToMany(Producto, {
        through: DetallePedido,
        foreignKey: 'pedidoId'
    });
    Producto.belongsToMany(Pedido, {
        through: DetallePedido,
        foreignKey: 'productoId'
    });
    */

    console.log("Asociaciones de modelos configuradas correctamente.");
};

module.exports = setupAssociations;