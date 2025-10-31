// controllers/orderController.js

const Pedido = require('../models/orderModel'); 
const DetallePedido = require('../models/orderDetailModel'); 
const Producto = require('../models/productModel'); 
const Usuario = require('../models/userModel'); 
const { Op } = require('sequelize'); // Solo si necesitas operadores complejos, lo dejamos por si acaso.

/**
 * Muestra el historial de pedidos del usuario.
 */
const viewOrders = async (req, res) => {
    // 🚨 NOTA: Se asume que el usuario está autenticado (req.user existe) 
    const userId = req.user.id; // Obtenemos el ID del usuario logueado

    try {
        // Buscamos todos los pedidos del usuario
        const pedidos = await Pedido.findAll({
            where: { usuarioId: userId },
            order: [['createdAt', 'DESC']] // Ordenamos del más reciente al más antiguo
        });

        res.render('orders/viewOrders', { 
            titulo: 'Historial de Pedidos',
            pedidos: pedidos,
        });

    } catch (error) {
        console.error("Error al mostrar el historial de pedidos:", error);
        req.flash('varMensaje', 'Error al cargar su historial de pedidos.');
        req.flash('varEstiloMensaje', 'alert-danger');
        res.redirect('/');
    }
};

/**
 * Muestra el detalle de un pedido específico.
 */
const viewOrderDetail = async (req, res) => {
    const pedidoId = req.params.id;
    const userId = req.user.id; // Para asegurar que solo vea sus propios pedidos

    try {
        const pedido = await Pedido.findOne({
            where: { 
                id: pedidoId,
                usuarioId: userId // Importante: Seguridad
            },
            include: [
                {
                    model: DetallePedido,
                    // Usamos el alias 'DetallePedidos' definido en models/associations.js
                    as: 'DetallePedidos', 
                    include: [
                        { model: Producto, attributes: ['nombre'] } // Incluimos el nombre del producto
                    ]
                },
                {
                    model: Usuario,
                    // ✅ CORRECCIÓN FINAL: Usamos 'nombre' ya que es el nombre de la columna en la tabla 'usuarios'.
                    attributes: ['id', 'nombre', 'apellido'] // Agregamos 'apellido' para más detalle si es necesario
                }
            ]
        });

        if (!pedido) {
            req.flash('varMensaje', 'Pedido no encontrado o no autorizado.');
            req.flash('varEstiloMensaje', 'alert-warning');
            return res.redirect('/pedidos');
        }

        res.render('orders/orderDetail', {
            titulo: `Detalle Pedido #${pedido.id}`,
            pedido: pedido.toJSON() // Convertimos a JSON para trabajar mejor en Handlebars
        });

    } catch (error) {
        console.error("Error al mostrar el detalle del pedido:", error);
        req.flash('varMensaje', 'Error al cargar el detalle del pedido.');
        req.flash('varEstiloMensaje', 'alert-danger');
        res.redirect('/pedidos');
    }
};


module.exports = {
    viewOrders,
    viewOrderDetail // Exportamos la nueva función
};