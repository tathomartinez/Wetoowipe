# Task List: API Connection Logging

## Phase 1: Foundation (Go API)

- [ ] Task 1: Domain model + Repository interface
  - **Acceptance:** `ConnectionLogEntry` struct exists in `internal/domain/`; interface `ConnectionLogRepository` with `Insert(ctx, entry)` defined in `internal/app/connectionlog/`
  - **Verify:** `go build ./...` compiles
  - **Files:** `go-api/internal/domain/connection_log.go`, `go-api/internal/app/connectionlog/repository.go`

- [ ] Task 2: Mongo repository implementation
  - **Acceptance:** `MongoDBRepository` implements `InsertConnectionLog` saving to `connection_logs` collection
  - **Verify:** `go test ./internal/infra/database/...`
  - **Files:** `go-api/internal/infra/database/mongo_repository.go`
  - **Depends on:** Task 1

- [ ] Task 3: Service layer
  - **Acceptance:** `ConnectionLogService` with `LogConnection(ctx, ip, userID, channelID, guildID, eventType)` extracts IP, generates timestamp, calls repository
  - **Verify:** `go test ./internal/app/connectionlog/...`
  - **Files:** `go-api/internal/app/connectionlog/service.go`, `go-api/internal/app/connectionlog/service_test.go`
  - **Depends on:** Task 1

- [ ] Task 4: HTTP handler + register route
  - **Acceptance:** `POST /api/v1/voice-log` accepts `{ "user_id", "channel_id", "guild_id", "event_type" }`, returns 201; missing fields return 400; no auth returns 401
  - **Verify:** `curl -X POST ...` manual test; `go test ./internal/infra/api/...`
  - **Files:** `go-api/internal/infra/api/connection_log_handler.go`, `go-api/cmd/main.go`
  - **Depends on:** Task 3

### Checkpoint: API Foundation
- [ ] `cd go-api && go build ./cmd/main.go` succeeds
- [ ] `cd go-api && go test ./...` passes

## Phase 2: Bot Integration

- [ ] Task 5: Bot API client function
  - **Acceptance:** New function `logVoiceConnection(userID, channelID, guildID, eventType)` in bot that calls `POST /api/v1/voice-log` with correct headers and body
  - **Verify:** Unit test with mocked fetch
  - **Files:** `bot/src/services/voiceLogService.ts`
  - **Depends on:** Task 4

- [ ] Task 6: Voice state event handler
  - **Acceptance:** On `voiceStateUpdate`, if user joins a channel (`channelId` from null → value), call `logVoiceConnection` with `event_type: "join"`; if leaves (value → null), call with `event_type: "leave"`; includes guild_id
  - **Verify:** Manual test joining/leaving voice channel; check MongoDB for documents
  - **Files:** `bot/src/events/voiceStateUpdate.ts`
  - **Depends on:** Task 5

### Checkpoint: Complete
- [ ] Bot detects join → API recibe → documento en `connection_logs`
- [ ] Bot detects leave → API recibe → documento en `connection_logs`
- [ ] `cd bot && npx tsc --noEmit` passes
- [ ] `cd bot && npx eslint .` passes
