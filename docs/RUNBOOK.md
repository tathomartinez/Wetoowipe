# Runbook — Wetoowipe

## Deploy Completo
```bash
make full-deploy
```

## Deploy Solo Commands
```bash
make commands
```

## Ver Logs del Bot
```bash
docker compose logs discord-bot --tail 100 -f
```

## Ver Logs de Go API
```bash
docker compose logs go-api --tail 100 -f
```

## Conectar a MongoDB
```bash
docker compose exec mongodb mongosh -u $MONGO_ROOT_USERNAME -p $MONGO_ROOT_PASSWORD
```

## Verificar Health del Go API
```bash
curl http://localhost:8080/
```

## Verificar TTS Server
```bash
curl http://localhost:7860/
```

## Troubleshooting

### Bot no inicia
1. Verificar token Discord: `docker compose logs discord-bot | grep -i error`
2. Verificar `.env` tiene todas las variables requeridas
3. `make rebuild`

### Go API no conecta a MongoDB
1. Verificar MongoDB está healthy: `docker compose ps`
2. Verificar `MONGO_URI` en `.env`
3. `docker compose restart go-api`

### TTS no funciona
1. Verificar GPU disponible: `nvidia-smi`
2. Verificar F5-TTS está corriendo: `curl http://localhost:7860/`
3. Verificar `f5-tts-cache` tiene modelos descargados

### Transferencia falla
1. Verificar Go API logs: `docker compose logs go-api`
2. Verificar MongoDB tiene replica set: `docker compose exec mongodb mongosh --eval "rs.status()"`
3. Verificar `API_TOKEN` está definido en `.env`

## Recovery

### Bot caído
```bash
make bot
```

### MongoDB corrupto (ÚLTIMO RECURSO)
```bash
docker compose down -v
rm -rf data/*
docker compose up -d mongodb
# Esperar healthcheck OK
docker compose up -d go-api
```

### Rotar Secrets
1. Generar nuevos tokens:
   ```bash
   openssl rand -hex 32  # API_TOKEN
   openssl rand -hex 32  # API_SECRET
   openssl rand -hex 32  # SECRET_KEY
   ```
2. Actualizar `.env`
3. `make rebuild`
