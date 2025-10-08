// Importa todos los modelos para inicializarlos
const Usuario = require('./usuario');

// Aquí irán las asociaciones de todos tus modelos (Producto, Carro, etc.)
// Ejemplo futuro:
// Usuario.hasMany(Carro);
// Carro.belongsTo(Usuario);

module.exports = {
    Usuario,
    // Exporta otros modelos aquí en el futuro
};