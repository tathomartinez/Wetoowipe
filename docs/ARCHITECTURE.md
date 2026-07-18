# Arquitectura — Wetoowipe

## Diagrama de Servicios

```
Discord User
    │
    ▼
Discord Bot (host network)
    ├──HTTP──► Go API (localhost:8080)
    ├──HTTP──► TTS Server (localhost:7860)
    ├──HTTP──► File Server (localhost:8082)
    ├──HTTP──► Raider.IO API (external)
    ├──HTTP──► Chuck Norris API (external)
    └──HTTP──► Simpsons API (external)

Go API
    ├──MongoDB──► MongoDB (mongodb:27017)
    └──HTTP──► Discord Webhook URL
```

## Flujo: Comando /transfer

```
1. User ejecuta /transfer en Discord
2. Bot recibe interaction en interactionCreate.ts
3. Bot llama POST /api/v1/accounts/{from}/transfer
4. Go API valida Bearer token (AuthMiddleware)
5. Go API inicia MongoDB session
6. Within transaction:
   a. Lee saldo origen
   b. Lee saldo destino
   c. Verifica fondos suficientes
   d. Actualiza saldo origen (-)
   e. Actualiza saldo destino (+)
   f. Crea registro de transacción
7. Commit transaction
8. Respuesta al bot → embed al usuario
```

## Capas Go API

```
cmd/main.go          → Entry point, router, server
config/config.go     → Environment variable loading
internal/
  domain/            → Data models (User, Transaction, SaleLogEntry)
  app/
    bank/            → Business logic (service + repository interface)
    rules/           → Rules business logic
    saleslog/        → Sales log with SHA validation
  infra/
    api/             → HTTP handlers, middleware (auth, CORS, rate limit)
    database/        → MongoDB repository implementation
    webhook/         → Discord webhook sender
```

## Capas Bot

```
main.ts              → Entry point, loads commands/events, starts joke cycle
src/
  core/
    client.ts        → Discord client setup
    commandLoader.ts → Dynamic command loading
    eventLoader.ts   → Dynamic event loading
    jokeManager.ts   → Joke cycle (API or file)
    musicPlayer.ts   → FFmpeg + voice playback
  commands/
    admin/           → /shutdown, /status, /update
    fun/             → /crearcuenta, /balance, /transfer, /amount, etc.
    misc/            → /help, /requirecarry, /equipodev
    mod/             → /purga
  events/            → Discord event handlers
  services/          → Logger, joke reader, message cleaner
  utils/             → Permission check, channel writer, DM sender
  config/config.ts   → Configuration constants
  data/whitelist.ts  → Whitelist data
```
