// models/orderDetailModel.js

const { DataTypes } = require('sequelize');
const { con_sequelize } = require('../database/connection_mysql_db');

const DetallePedido = con_sequelize.define('DetallePedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Precio al que se vendió el producto (importante para la contabilidad)
    precioVenta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = DetallePedido;