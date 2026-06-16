Función: Recibir las peticiones HTTP, extraer datos de req (body, params, query), llamar a los servicios correspondientes y enviar la respuesta con res. También manejan errores y los pasan al middleware.
Qué va aquí: Funciones getAll, create, update, delete para cada recurso.
Ejemplo: categorias.controller.js, clientes.controller.js.