#Dependencias

npm // gestor de paquestes de Node.Js
npm init -y // para inicializar el proyecto (primer comando que hay que lanzar antes de descargar las dependencias)
npm run 'especificar nombre'// Usará Nodemon para iniciar app.js
express // libreria de funciones y herramientas listas para manejar rutas, peticiones HTTP y respuestas sin programar desde cero
nodemon // reinicia el servidor al detectar cambios en los archivos, evitando reiniciar la app por cada nuevo cambio
dotenv // permite cargar y procesar las variables de entorno del archivo, evitando reiniciar la app por cada nuevo cambio
handlebars // permite mezclar lógica de programación dentro del HTML
express-validator // se útiliza junto a express para validar los datos de las solicitudes HTTP
express-session // gestiona junto con express las sesiones de usuario en el servidor (guarda info del user entre peticiones)
connect_flash // permite mostrarle mensajes de exito, error o advertencia al usuario
sequelize // es el orm de Node.Js
mysql2 // libreria que envia las consultas a la BD y recibe los resultados