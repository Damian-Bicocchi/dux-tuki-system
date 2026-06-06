# Dux Tuki System — Backend API v2.0

## Inicio rápido

```bash
npm install
npm run dev      # desarrollo (auto-reload)
npm start        # producción
```

Servidor en: `http://localhost:3001`

---

## Estructura del proyecto

```
backend/
├── server.js           # Entrada principal + inicialización de BD
├── routes/
│   ├── categorias.js
│   ├── articulos.js
│   ├── clientes.js
│   ├── alquileres.js
│   ├── costos.js
│   └── estadisticas.js
└── package.json
```

La base de datos SQLite se ubica en `../BD/database.db`

---

## Endpoints

### Categorías `/api/categorias`
| Método | URL                    | Descripción         |
|--------|------------------------|---------------------|
| GET    | /api/categorias        | Listar todas        |
| GET    | /api/categorias/:id    | Obtener una         |
| POST   | /api/categorias        | Crear               |
| PUT    | /api/categorias/:id    | Actualizar          |
| DELETE | /api/categorias/:id    | Eliminar            |

**Body POST/PUT:**
```json
{ "nombre": "Cámaras", "descripcion": "Cámaras de cine y fotografía" }
```

---

### Artículos `/api/articulos`
| Método | URL                                    | Descripción                        |
|--------|----------------------------------------|------------------------------------|
| GET    | /api/articulos                         | Listar (filtros: ?categoria_id, ?activo) |
| GET    | /api/articulos/:id                     | Obtener uno                        |
| GET    | /api/articulos/:id/disponibilidad      | Stock disponible en fechas         |
| POST   | /api/articulos                         | Crear                              |
| PUT    | /api/articulos/:id                     | Actualizar                         |
| DELETE | /api/articulos/:id                     | Eliminar                           |

**Body POST/PUT:**
```json
{
  "nombre": "Cámara RED V-Raptor",
  "descripcion": "Cámara cinema 8K",
  "precio_por_dia": 15000,
  "stock_total": 3,
  "categoria_id": 1,
  "activo": true
}
```

**GET disponibilidad:**
```
/api/articulos/1/disponibilidad?fecha_inicio=2025-07-01&fecha_fin=2025-07-05
```
Respuesta:
```json
{ "articulo_id": 1, "stock_total": 3, "ocupadas": 1, "disponibles": 2 }
```

---

### Clientes `/api/clientes`
| Método | URL                  | Descripción                        |
|--------|----------------------|------------------------------------|
| GET    | /api/clientes        | Listar (filtro: ?search=texto)     |
| GET    | /api/clientes/:id    | Obtener con historial de alquileres|
| POST   | /api/clientes        | Crear                              |
| PUT    | /api/clientes/:id    | Actualizar                         |
| DELETE | /api/clientes/:id    | Eliminar                           |

**Body POST/PUT:**
```json
{ "nombre": "Juan Pérez", "email": "juan@mail.com", "telefono": "1122334455", "notas": "Cliente frecuente" }
```

---

### Alquileres `/api/alquileres`
| Método | URL                            | Descripción                              |
|--------|--------------------------------|------------------------------------------|
| GET    | /api/alquileres                | Listar (filtros: ?estado, ?cliente_id, ?fecha_inicio, ?fecha_fin) |
| GET    | /api/alquileres/:id            | Obtener completo (con items)             |
| POST   | /api/alquileres                | Crear con items                          |
| PUT    | /api/alquileres/:id            | Actualizar completo                      |
| PATCH  | /api/alquileres/:id/estado     | Cambiar solo el estado                   |
| DELETE | /api/alquileres/:id            | Eliminar (solo cancelados/devueltos)     |

**Body POST/PUT:**
```json
{
  "cliente_id": 1,
  "fecha_inicio": "2025-07-10",
  "fecha_fin": "2025-07-15",
  "estado": "pendiente",
  "notas": "Pago 50% adelantado",
  "items": [
    { "articulo_id": 1, "cantidad": 2 },
    { "articulo_id": 3, "cantidad": 1, "precio_unitario_dia": 5000 }
  ]
}
```
> Si no se incluye `precio_unitario_dia` en el item, se usa el precio actual del artículo.
> El `precio_total` se calcula automáticamente: `precio_unitario_dia × cantidad × días`

**Body PATCH estado:**
```json
{ "estado": "activo" }
```
Estados válidos: `pendiente` | `activo` | `devuelto` | `cancelado`

---

### Costos `/api/costos`
| Método | URL               | Descripción                                   |
|--------|-------------------|-----------------------------------------------|
| GET    | /api/costos       | Listar (filtros: ?mes=2025-06, ?anio=2025)   |
| GET    | /api/costos/:id   | Obtener uno                                   |
| POST   | /api/costos       | Registrar costo                               |
| PUT    | /api/costos/:id   | Actualizar                                    |
| DELETE | /api/costos/:id   | Eliminar                                      |

**Body POST/PUT:**
```json
{ "descripcion": "Mantenimiento equipos", "monto": 25000, "fecha": "2025-06-15" }
```

---

### Estadísticas `/api/estadisticas`
| Método | URL                                          | Descripción                                    |
|--------|----------------------------------------------|------------------------------------------------|
| GET    | /api/estadisticas/resumen                    | ROI, ganancias bruta/neta, proyección anual    |
| GET    | /api/estadisticas/ingresos-por-mes           | Ingresos mes a mes (para gráfico)              |
| GET    | /api/estadisticas/articulos-mas-alquilados   | Ranking artículos                              |
| GET    | /api/estadisticas/clientes-frecuentes        | Ranking clientes                               |
| GET    | /api/estadisticas/calendario                 | Alquileres en un rango de fechas               |
| GET    | /api/estadisticas/stock-disponible           | Disponibilidad de todo el stock en fechas      |

**Ejemplos:**
```
/api/estadisticas/resumen?mes=2025-06
/api/estadisticas/ingresos-por-mes?anio=2025
/api/estadisticas/articulos-mas-alquilados?limit=5&mes=2025-06
/api/estadisticas/calendario?fecha_inicio=2025-07-01&fecha_fin=2025-07-31
/api/estadisticas/stock-disponible?fecha_inicio=2025-07-10&fecha_fin=2025-07-15
```

---

## Lógica de precios

El precio total de un alquiler se calcula automáticamente:

```
precio_total = Σ (precio_unitario_dia × cantidad × días)
```

- `días` = diferencia entre `fecha_fin` y `fecha_inicio` (mínimo 1 día)
- `precio_unitario_dia` se toma del artículo al momento de crear el alquiler, 
  pero puede sobreescribirse por item para precios especiales/descuentos.

## Lógica de stock

Al crear o editar un alquiler, el sistema verifica automáticamente que haya 
suficiente stock disponible para el rango de fechas. Si no hay disponibilidad, 
devuelve un error 400 con el detalle.
