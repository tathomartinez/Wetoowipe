# Voice Greeting Fix — Summary

## Problem
The bot joined voice channels but produced no audio. After entering, no greeting was heard.

## Root Causes
1. **Missing Opus encoder** — `@discordjs/voice` needs an Opus library to encode PCM audio for Discord. Neither `@discordjs/opus` nor `opusscript` were installed.

2. **Missing voice encryption library** — Discord voice uses XChaCha20-Poly1305 encryption (`libsodium-wrappers`). Without it, audio packets are silently dropped.

3. **Outdated `@discordjs/voice`** — version 0.18.0 had compatibility issues with Discord's 2025-2026 voice protocol changes. Updated to 0.19.2.

4. **FFmpeg started before connection Ready** — The UDP voice connection must reach `Ready` before audio is sent. Without waiting, FFmpeg's pipe died after 0.02s.

5. **Docker bridge network blocked UDP** — Discord voice uses high UDP ports (45000-65535). Docker's default bridge network does not route them. The `discord-bot` container needed `network_mode: "host"`.

6. **OGG Vorbis format** — `.ogg` files use Vorbis codec, requiring FFmpeg for conversion. Changed to WAV (PCM s16le) for simpler decoding.

## Files Changed

| File | Change |
|------|--------|
| `bot/src/core/musicPlayer.ts` | Complete rewrite — manual FFmpeg spawn, `entersState` wait for Ready, `activeConnections` guard, `inlineVolume`, error handlers, `selfDeaf: true` |
| `bot/src/audio/audioPaths.ts` | `BIENVENIDO` path from `.ogg` to `.wav` |
| `bot/src/audio/bienvenido.wav` | Converted from `bienvenido.ogg` (PCM s16le, 48kHz, stereo) |
| `docker-compose.yml` | `network_mode: "host"` for `discord-bot` service |
| `.env` | Service URLs changed from Docker DNS names to `localhost` (compatible with host networking) |
| `bot/package.json` | Added `opusscript`, `libsodium-wrappers`; updated `@discordjs/voice` to `^0.19.2` |

## Dependencies Added
- `opusscript` — pure-JS Opus encoder
- `libsodium-wrappers` — XChaCha20-Poly1305 voice encryption

## Dependencies Updated
- `@discordjs/voice` — 0.18.0 → 0.19.2
