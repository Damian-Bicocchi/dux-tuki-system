
  # Aplicación móvil de gestión

  This is a code bundle for Aplicación móvil de gestión. The original project is available at https://www.figma.com/design/Hyqh83JKzuBDUNOKxqJnwN/Aplicaci%C3%B3n-m%C3%B3vil-de-gesti%C3%B3n.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

# Guía de instalación y ejecución — Dux Tuki System

Repositorio oficial:

[https://github.com/Damian-Bicocchi/dux-tuki-system](https://github.com/Damian-Bicocchi/dux-tuki-system)

---

# Requisitos previos

Antes de ejecutar el proyecto necesitás tener instalado:

* Git
* NVM
* Node.js
* npm
* VS Code (opcional pero recomendado)

---

---

# 1. Instalar NVM

NVM permite administrar múltiples versiones de Node.js.

## Descargar e instalar NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

---

## Cargar NVM en la shell actual

```bash
\. "$HOME/.nvm/nvm.sh"
```

---

# 2. Instalar Node.js

```bash
nvm install 24
```

---

# 3. Verificar instalación

## Verificar Node.js

```bash
node -v
```

Debería mostrar algo similar a:

```bash
v24.16.0
```

---

## Verificar npm

```bash
npm -v
```

Debería mostrar algo similar a:

```bash
11.13.0
```

---

# 4. Clonar el repositorio

```bash
git clone https://github.com/Damian-Bicocchi/dux-tuki-system.git
```

---

# 5. Entrar al proyecto

```bash
cd tuki-system/Aplicación\ móvil\ de\ gestión/
```

---

# 6. Instalar dependencias

```bash
npm install
```

Esto descargará todas las dependencias necesarias definidas en el proyecto.

---

# 7. Ejecutar el proyecto

```bash
npm run dev
```

---

# 8. Abrir en el navegador

Normalmente el proyecto quedará disponible en:

```text
http://localhost:5173
```

O en:

```text
http://localhost:3000
```

Dependiendo de la configuración del proyecto.

---

# Problemas comunes

## Error: command not found: nvm

Ejecutar:

```bash
\. "$HOME/.nvm/nvm.sh"
```

---

## Error: npm command not found

Verificar que Node.js esté instalado:

```bash
node -v
npm -v
```

---

## Error durante npm install

Eliminar dependencias e intentar nuevamente:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

# Tecnologías utilizadas

El proyecto puede incluir:

* React
* Vite
* npm
* JavaScript o TypeScript

---

# Recomendaciones

* Utilizar VS Code
* Instalar la extensión oficial de React
* Mantener Node actualizado mediante NVM
* Ejecutar siempre el proyecto dentro de su carpeta

---

# Comandos útiles

## Cambiar versión de Node

```bash
nvm use 24
```

---

## Listar versiones instaladas

```bash
nvm ls
```

---

## Actualizar dependencias

```bash
npm update
```

---

# Licencia

Este proyecto pertenece a sus respectivos autores.

  