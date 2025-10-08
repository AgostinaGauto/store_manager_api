/*
Este codigo contiene toda la lógica para mostrar las vistas y procesar el registro.
*/

const mUsuario = require('../models/userModel');

// Muestra la vista del formulario de Registro
exports.mostrarRegistro = (req, res) => {
    // MODIFICACIÓN: La vista ahora es 'auth/register' para que busque register.hbs
    res.render('auth/register', {
        layout: 'public', // Usar el layout para páginas de autenticación
        titulo: 'Registro de Usuario'
    });
};

// Lógica para procesar el Registro de un nuevo usuario
exports.registrarUsuario = async (req, res) => {
    const { nombre, apellido, email, password, confirm_password } = req.body;

    // 1. Validaciones básicas
    if (password !== confirm_password) {
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', 'Las contraseñas no coinciden.');
        return res.redirect('/registro');
    }

    // 2. Comprobar si el email ya existe
    try {
        const usuarioExistente = await mUsuario.findOne({ where: { email } });

        if (usuarioExistente) {
            req.flash('varEstiloMensaje', 'alert-danger');
            req.flash('varMensaje', 'El email ya está registrado.');
            return res.redirect('/registro');
        }

        // 3. Crear el nuevo usuario
        // La contraseña se hashea automáticamente mediante el hook 'beforeCreate' en el modelo
        await mUsuario.create({
            nombre,
            apellido,
            email,
            password 
        });

        // 4. Éxito y redirección
        req.flash('varEstiloMensaje', 'alert-success');
        req.flash('varMensaje', 'Registro exitoso. ¡Inicia sesión para continuar!');
        res.redirect('/login');

    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', 'Ocurrió un error al intentar registrar. Inténtalo de nuevo.');
        res.redirect('/registro');
    }
};

// Muestra la vista del formulario de Login
exports.mostrarLogin = (req, res) => {
    // Si tu archivo es login.hbs, 'auth/login' es correcto.
    res.render('auth/login', {
        layout: 'public', // Usar el layout para páginas de autenticación
        titulo: 'Inicio de Sesión'
    });
};