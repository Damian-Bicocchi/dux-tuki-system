FROM node:20-alpine

WORKDIR /app

# Instalar dependencias de compilación para sqlite3 (nativo)
RUN apk add --no-cache python3 make g++

# Copiar archivos de dependencias primero (cache de capas)
COPY package.json package-lock.json* ./

RUN npm install

# Copiar el resto del código del backend
COPY . .

# Crear directorio para la base de datos
RUN mkdir -p /app/BD

EXPOSE 3001

CMD ["node", "server.js"]
