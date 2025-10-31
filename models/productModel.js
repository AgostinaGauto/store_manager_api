const { DataTypes } = require('sequelize');
const { con_sequelize } = require('../database/connection_mysql_db');

const Producto = con_sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: true,
            min: 0.01 // Requerimiento: El precio debe ser mayor a cero
        }
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0 // Requerimiento: El stock no podrá ser negativo
        }
    },
    stock_minimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0
        }
    },
    imagen: {
        type: DataTypes.STRING(100),
        allowNull: true // Se gestionará la carga de la imagen, pero el campo es una cadena
    },
    // 🚨 CAMBIO A 'categoriaId' para que coincida con lo que Sequelize espera
    categoriaId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Categoria',
            key: 'id'
        }
    }
}, {
    // Hooks de validación que verifican que el stock_minimo sea menor o igual al stock actual
    validate: {
        stockMinimoValidacion() {
            if (this.stock_minimo > this.stock) {
                throw new Error('El stock mínimo debe ser menor o igual al stock actual.');
            }
        }
    }
});

module.exports = Producto;






