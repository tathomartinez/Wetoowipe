FROM node:23-slim

WORKDIR /usr/src/app

# Copiamos solo los archivos de instalación primero para cachear bien
COPY package*.json ./

# Instalamos todo incluyendo devDependencies
RUN npm install

# Copiamos el resto del proyecto
COPY . .

CMD ["node", "main.js"]