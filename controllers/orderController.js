// controllers/orderController.js

const Pedido = require('../models/orderModel'); // Asegúrate de tener el modelo Pedido importado
// const DetallePedido = require('../models/orderDetailModel'); // Podrías necesitar esto más adelante

/**
 * Muestra el historial de pedidos del usuario.
 */
const viewOrders = async (req, res) => {
    // 🚨 NOTA: Se asume que el usuario está autenticado (req.user existe) 
    // y la compra en el checkout ya verificó esto.

    try {
        const userId = req.user.id; // Obtenemos el ID del usuario logueado

        // Buscamos todos los pedidos del usuario
        const pedidos = await Pedido.findAll({
            where: { usuarioId: userId },
            order: [['createdAt', 'DESC']] // Ordenamos del más reciente al más antiguo
            // Incluir el modelo de DetallePedido para obtener los ítems del pedido sería ideal aquí
        });

        res.render('orders/viewOrders', { 
            titulo: 'Historial de Pedidos',
            pedidos: pedidos,
            // Aquí puedes añadir lógica de formato si es necesario, pero es mejor hacerlo en la vista.
        });

    } catch (error) {
        console.error("Error al mostrar el historial de pedidos:", error);
        req.flash('varMensaje', 'Error al cargar su historial de pedidos.');
        req.flash('varEstiloMensaje', 'alert-danger');
        res.redirect('/');
    }
};

module.exports = {
    viewOrders
};