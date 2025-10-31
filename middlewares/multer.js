/*
Este código define un middleware utilizando la librería Multer para gestionar 
la subida de archivos (específicamente imágenes) a tu servidor.
Su objetivo es recibir un archivo enviado desde un formulario, 
aplicar reglas de validación (tipo y tamaño), y guardarlo con un nombre único 
en una carpeta específica del proyecto.
*/
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Configuración de Almacenamiento (Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define la carpeta de destino donde se guardarán las imágenes.
        // Asegúrate de que esta carpeta exista en tu proyecto: './public/uploads/productos'
        const dir = path.join(__dirname, '..', 'public', 'uploads', 'products');
        
        // Crea la carpeta si no existe
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Genera un nombre de archivo único para evitar colisiones
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname).toLowerCase();
        
        // El nombre guardado en la DB será solo el nombre del archivo
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        cb(null, filename);
    }
});

// 2. Filtro de Archivos (File Filter)
const fileFilter = (req, file, cb) => {
    // Acepta solo archivos de tipo imagen
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Acepta el archivo
    } else {
        // Rechaza el archivo e inserta un mensaje de error en req.flash
        req.flash('varEstiloMensaje', 'alert-danger');
        req.flash('varMensaje', 'Error: Solo se permiten archivos de imagen (jpg, jpeg, png).');
        cb(null, false); 
    }
};

// 3. Inicialización de Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 1024 * 1024 * 5 // Límite de 5MB por archivo
    } 
});

// Middleware para cargar un solo archivo llamado 'imagen'
exports.uploadImagen = upload.single('imagen');