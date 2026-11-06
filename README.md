# Dux Tuki System

Sistema de gestión de alquileres de equipos.

## Requisitos previos

- [Docker](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
- [Docker Compose](https://docs.docker.com/compose/) (viene incluido con Docker Desktop).

## Pasos para ejecutar la aplicación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Damian-Bicocchi/dux-tuki-system.git
cd dux-tuki-system
```

### 2. Levantar los contenedores

```bash
docker compose up --build
```

Esto va a construir las imágenes y levantar dos servicios:

- **Backend** (API Express + SQLite) en el puerto `3001`
- **Frontend** (React + Nginx) en el puerto `5173`

### 3. Acceder a la aplicación

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API Backend:** [http://localhost:3001](http://localhost:3001)

### 4. Credenciales por defecto

| Usuario            | Contraseña |
|--------------------|------------|
| admin@gmail.com    | Hola1234   |

### 5. Detener la aplicación

Presioná `Ctrl + C` en la terminal donde está corriendo, o ejecutá:

```bash
docker compose down
```

### 6. Limpiar todo (incluyendo la base de datos)

```bash
docker compose down -v
```

Esto elimina los contenedores y el volumen donde se persiste la base de datos SQLite. La próxima vez que levantes la aplicación, se va a crear una base de datos nueva con los datos de ejemplo.
