# Seguridad — Wetoowipe

## Autenticación

### Go API
- **Mecanismo:** Bearer token via `Authorization` header
- **Middleware:** `go-api/internal/infra/api/middleware.go`
- **Variable:** `API_TOKEN` en `.env`
- **Endpoints protegidos:** Todos excepto `/`, `/swagger/*`, `/health`

### Discord Bot
- **Admin check:** `isAuthorized()` en `bot/src/utils/permission.ts`
- **Variable:** `ADMIN_IDS` en `.env` (comma-separated user IDs)
- **Comandos protegidos:** `/shutdown`, `/purga`

## Secrets Management

| Secret | Ubicación | Riesgo |
|--------|-----------|--------|
| Discord Token | `.env` → `TOKEN` | CRITICAL — rotar si repo fue compartido |
| MongoDB Password | `.env` → `MONGO_ROOT_PASSWORD` | HIGH |
| Secret Key | `.env` → `SECRET_KEY` | HIGH — usado para SHA |
| API Token | `.env` → `API_TOKEN` | HIGH — auth del Go API |
| Webhook URL | `.env` → `DISCORD_WEBHOOK_URL` | MEDIUM |
| RaiderIO Key | `.env` → `RAIDERIO_KEY` | LOW |

## SHA Validation
- **Endpoint:** POST `/log`
- **Algoritmo:** SHA-512
- **Formato:** `sha512(fecha-valor-destinatario_id-secret_key)`
- **Implementación:** `go-api/internal/app/saleslog/service.go`

## Rate Limiting
- **Implementación:** `go-api/internal/infra/api/ratelimit.go`
- **Límite:** 100 requests/minuto por IP

## Pendiente
- [ ] HTTPS en producción (TLS termination)
- [ ] Audit logging para operaciones bancarias
- [ ] Rotación automática de secrets
- [ ] IP binding para MongoDB (quitar de 0.0.0.0)
