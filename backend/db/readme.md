Función: Gestionar la conexión a la base de datos y la inicialización de esquemas.
Qué va aquí: Módulo de conexión (singleton), scripts de creación de tablas (migraciones), y semillas básicas. Separa la lógica de acceso a la BD del resto de la aplicación.
Ejemplo: index.js (conexión), init.js (creación de tablas), migrations/ si usas migraciones versionadas.