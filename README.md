# 🤖 WetoowipeBot

Bot de Discord modular y personalizable con comandos slash, funciones programadas, pruebas automatizadas y soporte para Docker.

---

## 🚀 Características

- 🎯 Comandos slash organizados por categorías
- 😂 Generador de chistes desde archivo o API
- 🧹 Limpieza de mensajes con validación de permisos
- 🛡 Validación por IDs autorizados para comandos sensibles
- 🧪 Tests automáticos con [Vitest](https://vitest.dev/)
- 🐳 Soporte completo para Docker y Makefile

---

## ⚙️ Requisitos

- Docker
- Docker Compose
- (opcional) Node.js ≥ 18 si deseas desarrollo local

---

## 📦 Instalación

```bash
git clone https://github.com/tu-usuario/WetoowipeBot.git
cd WetoowipeBot
cp .env.example .env
# Luego edita tu token de Discord y configuración
```

---

## 🔧 Uso con Docker

### 🛠 Desarrollo y pruebas

```bash
make build         # Construye el contenedor
make test-docker   # Corre tests con Vitest en Docker
```

### 🚀 Despliegue de comandos

```bash
make deploy        # Ejecuta tests + deploy
make full-deploy   # Build + tests + deploy
```

---

## 📁 Estructura del proyecto

```
src/
├── commands/       # Comandos slash agrupados por categoría
├── core/           # Inicialización de eventos, cliente, comandos
├── events/         # Eventos del bot
├── services/       # Lógica reusable como chistes o limpieza
├── util/           # Validaciones y funciones utilitarias
├── scripts/        # Scripts como deploy-commands.js
└── data/           # Archivos como chistes.txt
```

---

## 🧪 Testing

```bash
npm install
npm test
```

O usar Docker:

```bash
make test-docker
```

---

## 🔐 Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```dotenv
DISCORD_TOKEN=tu_token_aquí
CLIENT_ID=tu_client_id
GUILD_ID=tu_guild_id
CHANNEL_JOKE=id_del_canal_para_chistes
ADMIN_IDS=123456789012345678,987654321098765432
```

---

## ✨ Comandos incluidos

- `/help` - Lista de comandos disponibles
- `/chiste` - Envía un chiste aleatorio
- `/purga` - Elimina mensajes (admin)
- `/shutdown` - Apaga el bot (admin)
- `/equipodev` - 👑
- `/status` - Estado del bot
- (y más…)

---

## 🧠 Créditos

Creado por [TuNombre] con ❤️ y mucho testing.

---

## 📄 Licencia

MIT
