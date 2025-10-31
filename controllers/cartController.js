// controllers/cartController.js

// Importamos los modelos si los necesitamos para obtener información detallada del producto
const Producto = require('../models/productModel'); 
const Pedido = require('../models/orderModel'); 
const DetallePedido = require('../models/orderDetailModel'); 
const { con_sequelize } = require('../database/connection_mysql_db'); // Para la transacción

// ----------------- Helper para manejar el carrito en sesión -----------------

/**
 * Inicializa el carrito en la sesión si no existe.
 * El carrito será un array de objetos: [{ id: 1, cantidad: 2, precio: 1000, nombre: '...', imagen: '...' }, ...]
 * @param {object} req - Objeto de solicitud
 */
const initializeCart = (req) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
};

/**
 * Obtiene los detalles completos (nombre, precio real) de los productos del carrito.
 * @param {Array} cart - Array de IDs y cantidades del carrito de la sesión.
 * @returns {Object} Un objeto con el array de detalles y el total.
 */
const getCartDetails = async (cart) => {
    if (cart.length === 0) return { cartItemsWithDetails: [], total: 0 };

    const productIds = cart.map(item => item.id);

    // 1. Consultar la DB para obtener los datos más recientes de los productos (precio, nombre, imagen)
    const productosDB = await Producto.findAll({
        where: { id: productIds },
        attributes: ['id', 'nombre', 'precio', 'imagen']
    });

    // 2. Crear un mapa para acceso rápido
    const productMap = productosDB.reduce((map, prod) => {
        map[prod.id] = { 
            nombre: prod.nombre, 
            precio: parseFloat(prod.precio),
            imagen: prod.imagen 
        };
        return map;
    }, {});

    let total = 0;

    // 3. Combinar datos del carrito con datos de la DB y calcular subtotales
    const cartItemsWithDetails = cart.map(item => {
        const dbInfo = productMap[item.id] || { nombre: 'Producto No Encontrado', precio: 0, imagen: '' };
        const subtotal = item.cantidad * dbInfo.precio;
        total += subtotal; 
        
        return {
            id: item.id,
            cantidad: item.cantidad,
            precio: dbInfo.precio, // Precio real de la DB
            nombre: dbInfo.nombre, 
            imagen: dbInfo.imagen,
            subtotal: subtotal 
        };
    }).filter(item => item.precio > 0); // Opcional: filtrar productos con precio 0 si no existen

    return { cartItemsWithDetails, total };
};


// --------------------------- Lógica del Carrito ---------------------------

/**
 * Muestra la vista del carrito con los productos actuales.
 */
const viewCart = async (req, res) => {
    try {
        initializeCart(req);
        const cart = req.session.cart;

        // Utilizamos la nueva función para obtener detalles y calcular el total
        const { cartItemsWithDetails, total } = await getCartDetails(cart);

        res.render('cart/viewCart', { 
            titulo: 'Carrito de Compras',
            cart: cartItemsWithDetails, // Pasamos el array con el subtotal
            total: total 
        });
    } catch (error) {
        console.error("Error al mostrar el carrito:", error);
        req.flash('varMensaje', 'Error al cargar los detalles del carrito.');
        req.flash('varEstiloMensaje', 'alert-danger');
        res.redirect('/');
    }
};

/**
 * Agrega un producto al carrito o incrementa su cantidad.
 */
const addToCart = async (req, res) => { 
    const { id, cantidad } = req.body; 
    const productId = parseInt(id);
    const productQuantity = parseInt(cantidad) || 1; 

    initializeCart(req);
    let cart = req.session.cart;
    
    // 1. Buscar el producto en la DB para obtener el precio real
    let precioReal = 0;
    try {
        const producto = await Producto.findByPk(productId, {
            attributes: ['precio']
        });
        
        if (!producto) {
            req.flash('varMensaje', `Error: Producto ID ${productId} no encontrado.`);
            req.flash('varEstiloMensaje', 'alert-danger');
            const backURL = req.header('Referer') || '/productos';
            return res.redirect(backURL);
        }
        precioReal = parseFloat(producto.precio);
        
    } catch (error) {
        console.error("Error al buscar el precio del producto:", error);
        req.flash('varMensaje', 'Error al procesar la solicitud del producto.');
        req.flash('varEstiloMensaje', 'alert-danger');
        const backURL = req.header('Referer') || '/productos';
        return res.redirect(backURL);
    }

    // 2. Verificar si el producto ya está en el carrito
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        // 3. Si existe, incrementar la cantidad
        cart[itemIndex].cantidad += productQuantity;
    } else {
        // 4. Si no existe, añadirlo al carrito con el precio real de la DB
        cart.push({
            id: productId,
            cantidad: productQuantity,
            precio: precioReal 
        });
    }

    req.flash('varMensaje', `Producto ID ${productId} agregado al carrito.`);
    req.flash('varEstiloMensaje', 'alert-success');

    // 🚨 CORRECCIÓN: Redirigir explícitamente al carrito
    return res.redirect('/carrito');
};

/**
 * Elimina un producto completamente del carrito.
 */
const removeFromCart = (req, res) => {
    const productId = parseInt(req.params.id);

    initializeCart(req);
    let cart = req.session.cart;

    // Filtrar para remover el producto con el ID especificado
    req.session.cart = cart.filter(item => item.id !== productId);

    req.flash('varMensaje', `Producto eliminado del carrito.`);
    req.flash('varEstiloMensaje', 'alert-warning');
    
    // Redirigir a la vista del carrito
    res.redirect('/carrito');
};

const checkout = async (req, res) => {
    // 1. Verificar Autenticación (Solo usuarios logueados pueden hacer checkout)
    if (!req.user) {
        req.flash('varMensaje', 'Debe iniciar sesión para finalizar la compra.');
        req.flash('varEstiloMensaje', 'alert-danger');
        return res.redirect('/login');
    }

    initializeCart(req);
    const cart = req.session.cart;

    // 2. Verificar que el carrito no esté vacío
    if (cart.length === 0) {
        req.flash('varMensaje', 'Su carrito está vacío.');
        req.flash('varEstiloMensaje', 'alert-warning');
        return res.redirect('/carrito');
    }
    
    // Usaremos una Transacción para asegurar la consistencia (si falla un paso, falla todo)
    const t = await con_sequelize.transaction();
    let totalPedido = 0;

    try {
        // 3. Obtener los detalles de los productos reales de la DB
        const productIds = cart.map(item => item.id);
        const productosDB = await Producto.findAll({
            where: { id: productIds },
            attributes: ['id', 'precio'],
            transaction: t
        });
        
        // Crear un mapa de precios para acceso rápido: { id: precio, ... }
        const preciosMap = productosDB.reduce((map, prod) => {
            map[prod.id] = parseFloat(prod.precio);
            return map;
        }, {});


        // 4. Crear el Pedido (la cabecera) con un Total temporal de 0
        const nuevoPedido = await Pedido.create({
            usuarioId: req.user.id,
            total: 0 // Se actualizará al final
        }, { transaction: t });

        // 5. Crear los Detalles del Pedido (las líneas)
        const detalles = cart.map(item => {
            const precioReal = preciosMap[item.id];
            const subtotal = precioReal * item.cantidad;
            totalPedido += subtotal; // Acumular el total final
            
            return {
                pedidoId: nuevoPedido.id,
                productoId: item.id,
                cantidad: item.cantidad,
                precioVenta: precioReal
            };
        });

        // Inserción masiva de los detalles del pedido
        await DetallePedido.bulkCreate(detalles, { transaction: t });

        // 6. Actualizar el Pedido con el Total Calculado
        await nuevoPedido.update({ total: totalPedido }, { transaction: t });

        // 7. Finalizar la transacción
        await t.commit();

        // 8. Limpiar el carrito de la sesión
        req.session.cart = [];

        req.flash('varMensaje', `¡Gracias por tu compra! Tu pedido N° ${nuevoPedido.id} ha sido registrado por $${totalPedido.toFixed(2)}.`);
        req.flash('varEstiloMensaje', 'alert-success');
        res.redirect('/pedidos'); // Redirigir a una vista de pedidos (a crear)

    } catch (error) {
        // Si algo falla, revertir todos los cambios
        await t.rollback();
        console.error("Error al procesar el checkout:", error);
        req.flash('varMensaje', 'Error al procesar la compra. Intente nuevamente.');
        req.flash('varEstiloMensaje', 'alert-danger');
        res.redirect('/carrito');
    }
};

// Puedes añadir updateCartQuantity si quieres actualizar cantidades individuales

module.exports = {
    viewCart,
    addToCart,
    removeFromCart,
    checkout
};
