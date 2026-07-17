# Wetoowipe - Agent Guide

## Quick start
```bash
# Install bot dependencies
cd bot && npm install

# Run tests (Vitest)
npm test
npm run test:ci     # single-run mode

# Lint
npx eslint .

# TypeScript check (inside bot/)
cd bot && ./node_modules/.bin/tsc --noEmit
```

## Docker workflow
All commands via `Makefile` at repo root:
- `make build` — build all containers
- `make launch` — start all services (`docker-compose up -d`)
- `make rebuild` — rebuild + start
- `make test-docker` — tests inside Docker
- `make deploy` — `test-docker` then register slash commands
- `make full-deploy` — build + test + deploy
- `make commands` — register slash commands only
- `make bot`, `make go-api`, `make mongo`, `make tts` — individual service management

## Architecture

### Discord Bot (`bot/`)
- Entry: `bot/main.ts` — loads commands, events, starts joke cycle, logs in
- Commands: `bot/src/commands/` — subdirs `admin/`, `fun/`, `misc/`, `mod/`, loaded recursively
- Events: `bot/src/events/` — `ready.ts`, `interactionCreate.ts`, voice/guild listeners
- Core: `bot/src/core/` — `client.ts` (Client with `commands` Collection), `commandLoader.ts`, `eventLoader.ts`, `jokeManager.ts`, `musicPlayer.ts`
- Jokes: configurable provider — `ApiJokeProvider` (Chuck Norris API) or `FileJokeProvider` (reads `chistes.txt`); cycle runs every 30 min
- TTS: calls `f5-tts:7860/gradio_api/call/infer` (NVIDIA GPU required)
- Audio playback: `@discordjs/voice`, joins voice channel, plays file, disconnects
- Config: `dotenv` from `.env` at repo root — requires `TOKEN`, `CLIENT_ID`, `GUILD_ID`, etc.
- TypeScript: ES2021, CommonJS, strict, ts-node for dev, compiled output to `bot/dist/`

### Go API (`go-api/`)
- Entry: `go-api/cmd/main.go` — gorilla/mux, MongoDB, logging
- Routes: `/api/v1/accounts/*` (bank), `/api/v1/webhook` (rules), `/log` (sales log), `/swagger/`
- Layers: `internal/app/` (bank, rules, saleslog), `internal/infra/` (api, database, logging, webhook), `internal/domain/`
- Uses swaggo for Swagger docs (`go-api/docs/`)

### Database
- MongoDB with auth (`MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`), init scripts in `init-mongo.d/`
- Mongo Express at `:8081` (debug profile only)

### Services
- `f5-tts`: F5-TTS with Gradio at `:7860`, NVIDIA GPU runtime
- `file-server`: nginx serving `shared-files/` at `:8082`
- `cron_entry.sh`: helper to generate `at`/cron entries (not production cron)

## Code style
- Tabs for indentation, single quotes, semicolons
- ESLint config in `bot/.eslintrc.json` (not flat config)
- `no-console: off`, `no-var: error`, `prefer-const: error`

## Known quirks
- F5-TTS: `pip install -e .` upgrades torch beyond compatible torchaudio. Fix: pinned to torch==2.5.1 torchaudio==2.5.1 torchvision==0.20.1 at startup. Adds ~1-2 min initial boot.
- Full `docker compose build f5-tts` takes >10 min (clones repo + builds deps). Prefer keeping the cached image.

## Migrations completed
- All `.js` source files converted to `.ts` — no `.js` files remain in `bot/src/`
- Unified dirs: `servicios/` → `services/`, `util/` → `utils/`
- `whiteList.json` moved to typed `bot/src/data/whitelist.ts`
- `node-fetch` removed (uses global `fetch` from Node 18+)
- `tsconfig.json`: `module: "Node16"`, `moduleResolution: "Node16"` (was `CommonJS`/`node`)
- `nodemon.json` watches `.ts` files now
