// models/orderModel.js

const { DataTypes } = require('sequelize');
const { con_sequelize } = require('../database/connection_mysql_db');

const Pedido = con_sequelize.define('Pedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Estado del pedido: Pendiente, Pagado, Enviado, Cancelado, etc.
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pendiente' 
    },
    // Fecha en que se realizó el pedido
    fechaPedido: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    // Total final del pedido, incluyendo impuestos/envío si aplica.
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
    // NOTA: Sequelize añadirá automáticamente 'createdAt' y 'updatedAt'
});

module.exports = Pedido;