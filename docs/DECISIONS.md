# Decisiones de Diseño (ADR)

## ADR-001: MongoDB Transactions para Transferencias
- **Estado:** Aceptado
- **Fecha:** 2025
- **Contexto:** Transferencias usaban dos `UpdateOne` separados sin atomicidad. Si el proceso fallaba entre las dos actualizaciones, el dinero podía crearse o destruirse.
- **Decisión:** Usar `mongo.Session()` con `WithTransaction()` para atomicidad.
- **Consecuencia:** Requiere MongoDB replica set (disponible por defecto en Docker).

## ADR-002: Auth Middleware Bearer Token
- **Estado:** Aceptado
- **Fecha:** 2025
- **Contexto:** Endpoints bancarios sin autenticación. Cualquiera con acceso al puerto podía crear cuentas y transferir dinero.
- **Decisión:** Middleware que valida `Authorization: Bearer <token>` contra `API_TOKEN` env var.
- **Consecuencia:** Bot debe enviar `API_TOKEN` en headers.

## ADR-003: host network para Discord Bot
- **Estado:** Aceptado
- **Contexto:** Discord voice requiere UDP directo. Docker bridge networks causan problemas con voice.
- **Decisión:** `network_mode: "host"` para el bot.
- **Consecuencia:** Bot accede a servicios via `localhost` en vez de Docker DNS names.

## ADR-004: Eliminar time.Sleep de Transferencias
- **Estado:** Aceptado
- **Contexto:** `time.Sleep(2s)` y `time.Sleep(1s)` en el path de transferencia eran innecesarios y reducían throughput.
- **Decisión:** Eliminar todos los `time.Sleep` de la lógica de negocio.
- **Consecuencia:** Transferencias son más rápidas pero no simulan procesamiento.

## ADR-005: Winston Logger Unificado
- **Estado:** Aceptado
- **Contexto:** Mezcla de `console.log` y Winston logger dificulta debugging y monitoreo.
- **Decisión:** Usar solo Winston logger en todo el bot.
- **Consecuencia:** Todos los logs van a archivos `app.log`, `debug.log`, `exceptions.log`.
