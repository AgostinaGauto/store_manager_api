// models/associations.js

// ------------------- IMPORTAR MODELOS -------------------
const Usuario = require('./userModel');
const Categoria = require('./categoryModel');
const Producto = require('./productModel');

// 🚨 IMPORTAR NUEVOS MODELOS DE PEDIDOS 🚨
const Pedido = require('./orderModel');
const DetallePedido = require('./orderDetailModel');

// ------------------- RELACIONES EXISTENTES -------------------

// Relación 1:N entre Categoria y Producto
// Una Categoria puede tener muchos Productos (1:N)
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

// 2. Relación Pedido <-> Producto (N:M a través de DetallePedido)
// Un Pedido tiene muchos Productos a través de DetallePedido
Pedido.belongsToMany(Producto, {
    through: DetallePedido,
    foreignKey: 'pedidoId'
});
Producto.belongsToMany(Pedido, {
    through: DetallePedido,
    foreignKey: 'productoId'
});

// 3. Relaciones directas para DetallePedido (para facilitar consultas)
// DetallePedido pertenece a un Pedido y a un Producto
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedidoId' });
DetallePedido.belongsTo(Producto, { foreignKey: 'productoId' });


// ------------------- EXPORTACIÓN DE MODELOS -------------------
// (No se necesita exportar si solo se llama en server.js, pero es buena práctica)
// module.exports = { Usuario, Categoria, Producto, Pedido, DetallePedido };


module.exports = {
    Usuario,
    Categoria,
    Producto
    // Exporta otros modelos aquí en el futuro
};