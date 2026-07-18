# Changelog

## [2.0.0] - 2025-07-17

### Security
- **Auth middleware** en Go API — Bearer token validation (`API_TOKEN`)
- **Admin check** en comando `/shutdown` — ahora requiere `ADMIN_IDS`
- **SHA-512 validation** habilitada en sales log endpoint
- **Secret key** movida de hardcoded `"12345678"` a variable de entorno `SECRET_KEY`
- **MongoDB puerto 27017** no longer exposed to host — only accessible via Docker network
- **Mongo Express** con basic auth habilitado
- **Rate limiting** — 100 requests/min per IP en Go API
- **CORS** middleware configurado
- **`.env.example`** creado como template de variables
- **`API_TOKEN` y `API_SECRET`** generados y agregados a `.env`
- **MongoDB fijado** a `mongo:8.0.6` (evita pulling `latest`)
- **Swagger** solo accesible en `APP_ENV != "production"`

### Architecture
- **MongoDB transactions atómicas** para transferencias bancarias — `mongo.Session()` con `WithTransaction()`
- **`time.Sleep` eliminado** del path de transferencias (2s + 1s innecesarios)
- **Código duplicado eliminado** — `GetTransactionsByAccount` removido de `mongo_repository.go`
- **Rate limiting middleware** — `go-api/internal/infra/api/ratelimit.go`
- **CORS middleware** — `go-api/internal/infra/api/cors.go`
- **Config.go expandido** — todas las variables de entorno centralizadas
- **Logger unificado** — `console.log` reemplazado por Winston en todos los comandos del bot
- **`logger.debug` → `logger.error`** para errores reales en `amount.ts`
- **jokeManager** — comentario corregido ("30 min" → "5 min")
- **IDs hardcodeados movidos** a `config.ts` via env vars (`VOICE_CHANNEL_ID`, `CARRY_CHANNEL_ID`, `GUILD_ID`)
- **Puerto Go API** configurable via `APP_PORT`

### Added
- `.env.example` — template de variables de entorno
- `go-api/internal/infra/api/middleware.go` — Bearer token auth
- `go-api/internal/infra/api/ratelimit.go` — rate limiting
- `go-api/internal/infra/api/cors.go` — CORS
- `bot/vitest.config.ts` — Vitest configuration
- `bot/src/utils/permission.test.ts` — permission tests (5 tests)
- `go-api/internal/app/bank/service_test.go` — bank service tests (8 tests)
- `MEMORY.md` — master reference for AI agents
- `docs/ARCHITECTURE.md` — system architecture diagram
- `docs/SECURITY.md` — security state documentation
- `docs/DECISIONS.md` — Architecture Decision Records (5 ADRs)
- `docs/RUNBOOK.md` — deployment, troubleshooting, recovery
- `docs/REFACTOR_PLAN.md` — complete refactor plan reference

### Changed
- `docker-compose.yml` — MongoDB 8.0.6, ports removed, auth enabled
- `init-mongo.d/init.js` — security comments added
- `AGENTS.md` — references to memory banks added
- `go-api/cmd/main.go` — env-based config, auth middleware, conditional swagger
- `go-api/internal/app/saleslog/service.go` — SHA validation enabled
- `go-api/internal/app/bank/repository.go` — `GetSession()` added
- `go-api/internal/app/bank/service.go` — atomic transfer with transactions
- `go-api/internal/infra/database/mongo_repository.go` — `GetSession()`, error fixes, duplicate removed
- `bot/src/commands/admin/shutdown.ts` — `isAuthorized()` check
- `bot/src/commands/fun/createAccount.ts` — logger
- `bot/src/commands/fun/transfer.ts` — logger
- `bot/src/commands/fun/amount.ts` — logger.error for errors
- `bot/src/commands/admin/status.ts` — logger
- `bot/src/commands/mod/purga.ts` — logger
- `bot/src/commands/misc/requireCarry.ts` — config.carryChannelId
- `bot/src/config/config.ts` — dynamic IDs from env
- `bot/src/events/listenerGuildMember.ts` — config.specificUserId
- `bot/src/soundtrack/DailySoundtrackScheduler.ts` — config.guildId, config.voiceChannelId

### Fixed
- `sha512.Sum` → `sha512.Sum512` (Go build error)
- `mongo.SessionContext` → `context.Context` (Go build error)
- `*mongo.Session` vs `mongo.Session` type mismatch in repository
- `fmt.Errorf` sin argumento en `mongo_repository.go`

## [Unreleased]

### Fixed
- Voice greeting audio not playing — bot now correctly joins, plays greeting, and leaves
- Voice connection stuck in `signalling -> connecting` loop — added `entersState` wait for `Ready` with 10s timeout
- FFmpeg pipe dying at 0.02s — audio resource is created only after the voice connection reaches `Ready`
- Docker bridge network blocking UDP voice packets — changed to `network_mode: "host"`
- Missing Opus encoder — added `opusscript` dependency
- Missing voice encryption — added `libsodium-wrappers` dependency

### Changed
- `@discordjs/voice` updated from 0.18.0 to 0.19.2
- Greeting audio file from OGG Vorbis to WAV PCM (`bienvenido.wav`)
- `.env` service URLs from Docker DNS to `localhost` for host networking compatibility
- `musicPlayer.ts` — manual FFmpeg spawn with raw PCM input, concurrent connection guard, cleanup logic

### Added
- `docs/voice-fix-summary.md` — detailed summary of the voice fix
- `docs/CHANGELOG.md` — this file
