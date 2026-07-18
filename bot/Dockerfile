FROM node:23-slim

# Instalar FFmpeg y otras dependencias necesarias
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

WORKDIR /usr/src/app

# Copiamos solo los archivos de instalación primero para cachear bien
COPY package*.json tsconfig.json ./

# Instalamos todas las dependencias (incluyendo las de desarrollo)
RUN npm install

# Instalamos TypeScript, nodemon y ts-node globalmente
RUN npm install -g typescript nodemon ts-node 
RUN npm install --save-dev @types/node-cron

# Copiamos el resto del proyecto
COPY . .

# Comando de inicio para desarrollo con nodemon
CMD ["nodemon", "--watch", "src", "--ext", "ts", "--exec", "ts-node", "main.ts"]