<<<<<<< HEAD:bot/Dockerfile
FROM node:23-slim

# Instalar FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /usr/src/app

# Copiamos solo los archivos de instalación primero para cachear bien
COPY package*.json ./

# Instalamos todo incluyendo devDependencies
RUN npm install

# Copiamos el resto del proyecto
COPY . .

=======
FROM node:23-slim

# Instalar FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /usr/src/app

# Copiamos solo los archivos de instalación primero para cachear bien
COPY package*.json ./

# Instalamos todo incluyendo devDependencies
RUN npm install

# Copiamos el resto del proyecto
COPY . .

>>>>>>> master:Dockerfile
CMD ["node", "main.js"]