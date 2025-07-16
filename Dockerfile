# Dockerfile para MapaClientes Backend
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Copiar el schema de Prisma
COPY prisma ./prisma

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Exponer puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
