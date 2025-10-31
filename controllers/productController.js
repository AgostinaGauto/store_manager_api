const mProducto = require('../models/productModel');
const mCategoria = require('../models/categoryModel');
const fs = require('fs');
const path = require('path');

// Función 1: Listar todos los productos
exports.listarProductos = async (req, res) => {
    try {
        // Incluye la categoría (asociación) para mostrar su nombre
        const productos = await mProducto.findAll({
            include: [{ 
                model: mCategoria, 
                // 🚨 CORRECCIÓN: El alias 'as' debe coincidir con el alias definido en la asociación. 
                // Si no se define un alias explícito en el modelo, Sequelize usa el singular (Categorium).
                as: 'Categorium', 
                attributes: ['nombre'] 
            }],
            order: [['nombre', 'ASC']]
        });
        
        // --- Bloque try/catch para atrapar errores de renderizado ---
        try {
            return res.render('product/listProducts', { // Asumimos views/product/listProducts.hbs
                layout: 'main',
                titulo: 'Gestión de Productos',
                productos: productos
            });
        } catch (renderError) {
             console.error("Error de renderizado de Handlebars en listProducts:", renderError);
             req.flash('varEstiloMensaje', 'alert-danger');
             req.flash('varMensaje', 'Error al cargar la plantilla de productos. Revisa listProducts.hbs.');
             // Si falla el render, redirigimos a la raíz como último recurso
             return res.redirect('/'); 
        }
        // -----------------------------------------------------------

    } catch (error) {
        console.error("Error al listar productos (consulta Sequelize):", error);
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', 'Error interno del servidor al cargar el listado de productos.');
        return res.redirect('/');
    }
};

// Función 2: Muestra el formulario de Creación (Alta)
exports.mostrarCrear = async (req, res) => {
    try {
        const categorias = await mCategoria.findAll({ 
            order: [['nombre', 'ASC']] 
        });

        return res.render('product/createProduct', {
            layout: 'main',
            titulo: 'Crear Nuevo Producto',
            categorias: categorias,
            // Las variables de sesión se pasan automáticamente, no es necesario incluirlas aquí,
            // pero las incluimos para consistencia en el re-renderizado de error.
            nombre: req.flash('nombre'), 
            precio: req.flash('precio'),
            stock: req.flash('stock'),
            stock_minimo: req.flash('stock_minimo'),
            id_categoria: req.flash('id_categoria') 
        });
    } catch (error) {
        console.error("Error al cargar categorías para el formulario:", error);
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', 'Error al cargar el formulario de producto.');
        return res.redirect('/productos');
    }
};

// Función 3: Procesa la Creación de un Producto (Alta)
exports.crearProducto = async (req, res) => {
    
    const imagenNombre = req.file ? req.file.filename : null; 
    
    // Mantenemos id_categoria como nombre en req.body para que coincida con el formulario
    // pero la mapeamos a categoriaId para Sequelize.
    const { nombre, precio, stock, stock_minimo, id_categoria } = req.body;
    const categoriaId = id_categoria; 

    try {
        await mProducto.create({
            nombre,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            stock_minimo: parseInt(stock_minimo),
            imagen: imagenNombre, 
            // Usamos categoriaId para Sequelize
            categoriaId: parseInt(categoriaId) 
        });
        
        req.flash('varEstiloMensaje', 'alert-success');
        req.flash('varMensaje', `Producto "${nombre}" creado exitosamente.`);
        // 🚨 Redirección exitosa
        return res.redirect('/productos'); 
    } catch (error) {
        // --- Manejo de errores de Sequelize ---
        
        // 1. Si falla Sequelize, borramos la imagen que Multer pudo haber subido
        if (imagenNombre) {
            fs.unlink(path.join(__dirname, '..', 'public', 'uploads', 'products', imagenNombre), (err) => {
                if (err) console.error("Error al borrar imagen fallida:", err);
            });
        }
        
        console.error("Error al crear producto:", error);
        
        // 2. Insertar mensaje de error
        const errorMessage = error.errors ? error.errors[0].message : 'Error al intentar crear el producto. Revise los campos.';
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', errorMessage);
        
        // 3. Volver a renderizar el formulario con los datos enviados (para que el usuario no pierda lo escrito)
        req.flash('nombre', nombre);
        req.flash('precio', precio);
        req.flash('stock', stock);
        req.flash('stock_minimo', stock_minimo);
        req.flash('id_categoria', id_categoria);

        return res.redirect('/productos/crear');
    }
};

// Función 4: Muestra el formulario de Edición (Modificación)
exports.mostrarEditar = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await mProducto.findByPk(id);

        if (!producto) {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Producto no encontrado.');
            return res.redirect('/productos');
        }

        const categorias = await mCategoria.findAll({ 
            order: [['nombre', 'ASC']] 
        });
        
        return res.render('product/editProduct', {
            layout: 'main',
            titulo: `Editar Producto: ${producto.nombre}`,
            producto: producto, 
            categorias: categorias,
            // El campo de la vista sigue siendo id_categoria, pero su valor viene de categoriaId
            id_categoria: producto.categoriaId 
        });
    } catch (error) {
        console.error("Error al mostrar la edición de producto:", error);
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', 'Error al cargar el formulario de edición de producto.');
        return res.redirect('/productos');
    }
};

// Función 5: Procesa la Actualización (Modificación)
exports.actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, stock_minimo, id_categoria } = req.body;
    const categoriaId = id_categoria; 
    let imagenNombre = req.file ? req.file.filename : null;

    try {
        const producto = await mProducto.findByPk(id);

        if (!producto) {
            if (imagenNombre) {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads', 'products', imagenNombre));
            }
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error: Producto no encontrado para actualizar.');
            return res.redirect('/productos');
        }

        if (imagenNombre) {
            const imagenAnterior = producto.imagen;
            
            // Borrar imagen anterior solo si existe
            if (imagenAnterior) {
                const oldImagePath = path.join(__dirname, '..', 'public', 'uploads', 'products', imagenAnterior);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        } else {
            imagenNombre = producto.imagen;
        }

        producto.nombre = nombre;
        producto.precio = parseFloat(precio);
        producto.stock = parseInt(stock);
        producto.stock_minimo = parseInt(stock_minimo);
        producto.categoriaId = parseInt(categoriaId); // Usar categoriaId
        producto.imagen = imagenNombre;

        await producto.save();

        req.flash('varEstiloMensaje', 'alert-success');
        req.flash('varMensaje', `Producto "${nombre}" actualizado exitosamente.`);
        return res.redirect('/productos');
    } catch (error) {
        // Borrar nueva imagen si la actualización de Sequelize falla
        if (req.file) {
            fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads', 'products', req.file.filename));
        }
        
        console.error("Error al actualizar producto:", error);
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', error.errors ? error.errors[0].message : 'Error al intentar actualizar el producto. Revise los campos.');
        
        return res.redirect(`/productos/editar/${id}`);
    }
};

// Función 6: Procesa la Eliminación (Baja)
exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;

    try {
        const producto = await mProducto.findByPk(id);

        if (!producto) {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error: El producto no pudo ser encontrado.');
            return res.redirect('/productos');
        }

        const imagenNombre = producto.imagen;
        if (imagenNombre) {
            const imagePath = path.join(__dirname, '..', 'public', 'uploads', 'products', imagenNombre);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await producto.destroy();

        req.flash('varEstiloMensaje', 'alert-warning');
        req.flash('varMensaje', `Producto "${producto.nombre}" eliminado exitosamente.`);
        return res.redirect('/productos');
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'No se puede eliminar el producto porque está asociado a pedidos históricos.');
        } else {
            console.error("Error al eliminar producto:", error);
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error interno al intentar eliminar el producto.');
        }
        return res.redirect('/productos');
    }
};