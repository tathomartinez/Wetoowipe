# Wetoowipe — Memory Bank

## Resumen
Discord bot con API Go, MongoDB, TTS (F5-TTS), y sistema bancario virtual para un gremio de World of Warcraft.

## Stack
| Capa | Tecnología |
|------|-----------|
| Bot | Node.js 23, TypeScript, discord.js |
| API | Go 1.24, gorilla/mux, mongo-driver v2 |
| DB | MongoDB 8.0.6 |
| TTS | F5-TTS (Python, CUDA, NVIDIA GPU) |
| Archivos | nginx |
| Infra | Docker Compose, Makefile |

## Servicios
| Servicio | Puerto | Network |
|----------|--------|---------|
| discord-bot | host mode | host |
| go-api | 8080 | my_network |
| mongodb | 27017 (interno) | my_network |
| f5-tts | 7860 | my_network |
| file-server | 80 (interno) | my_network |
| db-client | 8081 (debug only) | my_network |

## Comandos Discord
| Comando | Descripción | Auth |
|---------|------------|------|
| /shutdown | Apaga el bot | Admin |
| /status | Estado del bot | No |
| /purga | Limpia mensajes | Admin |
| /crearcuenta | Crea cuenta bancaria | No |
| /balance | Consulta saldo | No |
| /transfer | Transfiere dinero | No |
| /amount | Envía dinero + log | No |
| /chiste | Cuenta un chiste | No |
| /requirecarry | Busca grupo PvE/PvP | No |
| /help | Lista comandos | No |

## Variables de Entorno Requeridas
Ver `.env.example` para la lista completa.

## Convenciones
- Tabs, single quotes, semicolons (ESLint)
- Winston logger (no console.log)
- Command pattern para slash commands
- Repository pattern en Go
- MongoDB transactions para transferencias

## Seguridad
- Auth: Bearer token en Go API (`API_TOKEN`)
- Admin: `ADMIN_IDS` env var en bot
- SHA-512 validation en sales log
- Secrets en `.env` (gitignored)
- Rate limiting: 100 req/min por IP
- CORS configurado

## Deployment
```bash
make full-deploy    # build + test + deploy
make rebuild        # rebuild + start
make deploy         # test + register commands
```
