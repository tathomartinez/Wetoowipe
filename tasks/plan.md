# Implementation Plan: API Connection Logging (IP + Canal de Voz)

## Overview

Registrar en MongoDB cada vez que un usuario de Discord se conecta o desconecta de un canal de voz. El bot detecta el evento `voiceStateUpdate` y llama al API, que guarda: **IP del caller**, **UserID**, **ChannelID**, **GuildID**, **tipo de evento** (join/leave) y **timestamp**.

## Architecture Decisions

- **Nuevo modelo** `ConnectionLogEntry` en `internal/domain/` — separado de modelos existentes
- **Nueva colección** `connection_logs` en MongoDB — no mezclar con `sales_logs` ni `users`
- **Nuevo endpoint** `POST /api/v1/voice-log` — autenticado vía `AuthMiddleware`
- **IP:** usa `X-Forwarded-For` si existe, sino `r.RemoteAddr`
- **Bot:** detecta join cuando `channelId` cambia de `null` a valor; leave cuando cambia de valor a `null`
- **Timestamp** se genera en el servidor Go, no lo envía el bot

## Task List

### Phase 1: Foundation (Go API)

- [ ] Task 1: Domain model + Repository interface
- [ ] Task 2: Mongo repository implementation
- [ ] Task 3: Service layer
- [ ] Task 4: HTTP handler + register route

### Checkpoint: API Foundation
- [ ] Build succeeds: `cd go-api && go build ./cmd/main.go`
- [ ] Tests pass: `cd go-api && go test ./...`

### Phase 2: Bot Integration

- [ ] Task 5: Bot API client function
- [ ] Task 6: Voice state event handler (join/leave detection)

### Checkpoint: Complete
- [ ] End-to-end: bot detecta join → llama API → documento en MongoDB
- [ ] End-to-end: bot detecta leave → llama API → documento en MongoDB
- [ ] Lint clean: `cd bot && npx eslint .`

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| IP falsa por spoofing | Bajo | Solo informativo, no se usa para auth |
| Bot no detecta todos los eventos | Medio | Discord garantiza `voiceStateUpdate` |
| Falla de MongoDB no bloquea request | Bajo | Loggear error pero responder 200 igual |

## Open Questions

- Ninguna por ahora
