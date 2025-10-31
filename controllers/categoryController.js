const mCategoria = require('../models/categoryModel');

// Función 1: Listar todas las categorías (Consulta)
exports.listarCategorias = async (req, res) => {
    try {
        // En esta etapa, es crucial que la configuración de Handlebars en server.js 
        // esté correcta (runtimeOptions) para que los datos de Sequelize se muestren.
        const categorias = await mCategoria.findAll({
            order: [['nombre', 'ASC']]
        });
        
        res.render('category/listCategories', {
            layout: 'main',
            titulo: 'Gestión de Categorías',
            categorias: categorias
        });
    } catch (error) {
        console.error("Error al listar categorías:", error);
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', 'Error interno del servidor al cargar el listado.');
        res.redirect('/');
    }
};

// Función 2: Muestra el formulario de Creación (Alta)
exports.mostrarCrear = (req, res) => {
    res.render('category/createCategory', {
        layout: 'main',
        titulo: 'Crear Nueva Categoría'
    });
};

// Función 3: Procesa la Creación de una Categoría (Alta)
exports.crearCategoria = async (req, res) => {
    const { nombre } = req.body;

    try {
        await mCategoria.create({ nombre });
        
        req.flash('varEstiloMensaje', 'alert-success');
        req.flash('varMensaje', `Categoría "${nombre}" creada exitosamente.`);
        res.redirect('/categorias');
    } catch (error) {
        [cite_start]// Validación de unicidad requerida por el enunciado [cite: 44]
        if (error.name === 'SequelizeUniqueConstraintError') {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error: El nombre de la categoría ya existe.');
        } else {
            console.error("Error al crear categoría:", error);
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error al intentar crear la categoría. Inténtelo de nuevo.');
        }
        res.render('category/createCategory', {
            layout: 'main',
            titulo: 'Crear Nueva Categoría',
            nombre
        });
    }
};


// ----------------------------------------------------------------------
// 🚨 FUNCIONES DE EDICIÓN Y ELIMINACIÓN COMPLETAS 🚨
// ----------------------------------------------------------------------

// Función 4: Muestra el formulario de Edición (Modificación)
exports.mostrarEditar = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await mCategoria.findByPk(id);

        if (!categoria) {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Categoría no encontrada.');
            return res.redirect('/categorias');
        }

        res.render('category/editCategory', { 
            layout: 'main',
            titulo: `Editar Categoría: ${categoria.nombre}`,
            categoria // Pasamos el objeto para rellenar el formulario
        });
    } catch (error) {
        console.error("Error al mostrar la edición:", error);
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', 'Error al cargar el formulario de edición.');
        res.redirect('/categorias');
    }
};

// Función 5: Procesa la Actualización (Modificación)
exports.actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    try {
        const categoria = await mCategoria.findByPk(id);

        if (!categoria) {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error: Categoría no encontrada para actualizar.');
            return res.redirect('/categorias');
        }

        // Aplicamos la actualización
        categoria.nombre = nombre;
        await categoria.save();

        req.flash('varEstiloMensaje', 'alert-success');
        req.flash('varMensaje', `Categoría "${nombre}" actualizada exitosamente.`);
        res.redirect('/categorias');
    } catch (error) {
        // Manejo de error de unicidad durante la edición
        if (error.name === 'SequelizeUniqueConstraintError') {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error: El nombre de la categoría ya existe.');
        } else {
            console.error("Error al actualizar categoría:", error);
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error al intentar actualizar la categoría.');
        }
        // Redirige de vuelta al formulario de edición si falla
        res.redirect(`/categorias/editar/${id}`);
    }
};

// Función 6: Procesa la Eliminación (Baja)
exports.eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await mCategoria.destroy({
            where: { id }
        });

        if (resultado > 0) {
            req.flash('varEstiloMensaje', 'alert-warning');
            req.flash('varMensaje', 'Categoría eliminada exitosamente.');
        } else {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error: La categoría no pudo ser encontrada o ya fue eliminada.');
        }
        res.redirect('/categorias');
    } catch (error) {
        // Manejo de restricción de clave foránea (si hay productos asociados)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'No se puede eliminar la categoría porque tiene productos asociados.');
        } else {
            console.error("Error al eliminar categoría:", error);
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'Error interno al intentar eliminar la categoría.');
        }
        res.redirect('/categorias');
    }
};