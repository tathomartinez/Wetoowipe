# Changelog

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
