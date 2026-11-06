FROM node:20-alpine AS build

WORKDIR /app

# Copiar el archivo utilitario compartido del backend (mantiene la ruta relativa de los imports)
COPY backend/utils/putHeaders.ts /app/backend/utils/putHeaders.ts

# Cambiar al directorio del frontend
WORKDIR /app/frontend

# Copiar archivos de dependencias
COPY frontend/package.json frontend/package-lock.json* ./

# Instalar dependencias + react y react-dom (son peerDependencies opcionales)
RUN npm install && npm install react@18.3.1 react-dom@18.3.1

# Copiar el resto del código del frontend
COPY frontend/ .

# Build de producción
RUN npm run build

# --- Etapa de producción con Nginx ---
FROM nginx:alpine

# Copiar el build al directorio de Nginx
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Configuración de Nginx para SPA (react-router)
COPY --from=build /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
