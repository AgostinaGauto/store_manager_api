/*
Este modelo define la tabla Categoria con el requisito de que el nombre sea único.
*/


const { DataTypes } = require('sequelize');
const { con_sequelize } = require('../database/connection_mysql_db');

const Categoria = con_sequelize.define('Categoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // Requisito: no se permiten categorías duplicadas
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    }
});

module.exports = Categoria;