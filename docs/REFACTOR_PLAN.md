# PLAN MAESTRO: Wetoowipe — Seguridad + Arquitectura + Memory Banks

> **Fecha:** 2025-07-17
> **Estado:** COMPLETADO ✅
> **Total:** 35 archivos (20 editados + 15 nuevos)

---

## FASE 1: SEGURIDAD URGENTE

### 1.1 — NUEVO: `.env.example`
Template de variables de entorno sin valores sensibles.

### 1.2 — EDITAR: `.env`
Agregar `API_TOKEN`, `API_SECRET`, `VOICE_CHANNEL_ID`, `CARRY_CHANNEL_ID`, `APP_ENV`.

### 1.3 — EDITAR: `go-api/cmd/main.go`
- Secret key hardcoded → `os.Getenv("SECRET_KEY")`
- Auth middleware en router
- Swagger solo en development
- Puerto configurable via `APP_PORT`

### 1.4 — EDITAR: `go-api/internal/app/saleslog/service.go`
Habilitar SHA-512 validation (descomentar lógica).

### 1.5 — NUEVO: `go-api/internal/infra/api/middleware.go`
Bearer token auth middleware.

### 1.6 — EDITAR: `bot/src/commands/admin/shutdown.ts`
Agregar `isAuthorized()` check.

### 1.7 — EDITAR: `docker-compose.yml`
- Quitar port 27017 de MongoDB
- Quitar port 8082 de file-server
- Fijar `mongo:7.0`
- Habilitar basic auth en Mongo Express
- Agregar `API_TOKEN` a go-api env

### 1.8 — EDITAR: `init-mongo.d/init.js`
Agregar comentarios de seguridad.

---

## FASE 2: INTEGRIDAD Y ARQUITECTURA

### 2.1 — EDITAR: `go-api/internal/app/bank/repository.go`
Agregar `GetSession()`, eliminar `GetTransactionsByAccount` duplicado.

### 2.2 — EDITAR: `go-api/internal/app/bank/service.go`
Reescribir `Transfer` con MongoDB transactions atómicas. Eliminar `time.Sleep`.

### 2.3 — EDITAR: `go-api/internal/infra/database/mongo_repository.go`
Implementar `GetSession()`, fix `fmt.Errorf` sin argumento, eliminar duplicado.

### 2.4 — NUEVO: `go-api/internal/infra/api/ratelimit.go`
Rate limiting middleware (100 req/min).

### 2.5 — NUEVO: `go-api/internal/infra/api/cors.go`
CORS middleware.

### 2.6 — EDITAR: `go-api/config/config.go`
Expandir para incluir todas las variables de entorno.

### 2.7 — EDITAR: `bot/src/commands/fun/createAccount.ts`
`console.log` → `logger`.

### 2.8 — EDITAR: `bot/src/commands/fun/transfer.ts`
`console.log` → `logger`.

### 2.9 — EDITAR: `bot/src/commands/admin/status.ts`
`console.log` → `logger`.

### 2.10 — EDITAR: `bot/src/commands/mod/purga.ts`
`console.log` → `logger`.

### 2.11 — EDITAR: `bot/src/commands/fun/amount.ts`
`logger.debug` → `logger.error` para errores.

### 2.12 — EDITAR: `bot/src/core/jokeManager.ts`
Fix comentario "30 minutos" → "5 minutos".

### 2.13 — EDITAR: `bot/src/config/config.ts`
Agregar IDs dinámicos desde env vars.

### 2.14 — EDITAR: `bot/src/events/listenerGuildMember.ts`
Usar config en vez de hardcoded ID.

### 2.15 — EDITAR: `bot/src/soundtrack/DailySoundtrackScheduler.ts`
Usar config en vez de hardcoded IDs.

### 2.16 — EDITAR: `bot/src/commands/misc/requireCarry.ts`
Usar config en vez de hardcoded ID.

---

## FASE 3: TESTING

### 3.1 — NUEVO: `bot/vitest.config.ts`
### 3.2 — NUEVO: `bot/src/utils/permission.test.ts`
### 3.3 — NUEVO: `go-api/internal/app/bank/service_test.go`

---

## FASE 4: MEMORY BANKS PARA AGENTES IA

### 4.1 — NUEVO: `MEMORY.md`
### 4.2 — NUEVO: `docs/ARCHITECTURE.md`
### 4.3 — NUEVO: `docs/SECURITY.md`
### 4.4 — NUEVO: `docs/DECISIONS.md`
### 4.5 — NUEVO: `docs/RUNBOOK.md`
### 4.6 — EDITAR: `AGENTS.md` (agregar referencia a memory banks)
