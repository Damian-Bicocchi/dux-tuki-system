Función: Interceptar las peticiones antes de que lleguen a los controladores. Se usan para autenticación, validación de datos, logging, manejo de errores global, etc.
Qué va aquí: Funciones de Express de tipo (req, res, next).
Ejemplo: auth.js (verificar token), validation.js (usar express-validator), errorHandler.js (capturar errores y responder JSON).