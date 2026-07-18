# Entrenamiento F5-TTS

Guía para entrenar el modelo de voz Spanish-F5 con audios personalizados.

## Estructura

```
training/
├── datasets/                    # ← DATOS (no se suben a git)
│   └── <nombre_dataset>/
│       ├── raw_audio/           # Audios originales
│       │   ├── audio1.wav
│       │   ├── audio2.wav
│       │   └── metadata.csv     # Textos asociados
│       └── processed/           # Dataset procesado
│           ├── raw.arrow
│           ├── duration.json
│           └── vocab.txt
├── checkpoints/                 # ← MODELOS (no se suben a git)
│   └── <nombre_dataset>/
│       └── model_*.pt
├── prepare_dataset.sh           # Preparar dataset
├── train.sh                     # Entrenar modelo
├── convert_audio.sh             # Convertir audios
└── README.md                    # Este archivo
```

## Requisitos

- Docker con soporte NVIDIA GPU
- ffmpeg instalado (en tu máquina)
- ~10GB de espacio libre para el modelo

## Paso 1: Preparar los audios

### Formato requerido

| Propiedad | Valor |
|-----------|-------|
| Formato | WAV PCM 16-bit |
| Sample rate | 24000 Hz |
| Canales | Mono (1) |
| Duración | 1-30 segundos por clip |

### Crear tus audios

**Opción A: Grabar con herramienta externa**
- Audacity (gratis): https://www.audacityteam.org/
- Tu móvil o grabador de voz
- Envía los audios por Discord y guárdalos

**Opción B: Convertir audios existentes**
```bash
# Convertir una carpeta de audios
./training/convert_audio.sh /ruta/mis/audios training/datasets/mi_voz/raw_audio

# Convertir un solo archivo
ffmpeg -i entrada.mp3 -ar 24000 -ac 1 -acodec pcm_s16le salida.wav
```

### Tips para buena calidad

- Grabar en lugar silencioso (sin eco, sin ruido de fondo)
- Hablar claro y a velocidad normal
- Un clip por frase (cortar entre oraciones)
- Evitar música o sonidos de fondo
- Usar micrófono de buena calidad (el del móvil suele bastar)
- Grabar a ~20cm de distancia

## Paso 2: Crear metadata.csv

Crea un archivo `metadata.csv` dentro de la carpeta del dataset:

```
training/datasets/mi_voz/raw_audio/metadata.csv
```

Formato (separador `|`):
```csv
audio_file|text
wavs/saludo.wav|Hola, bienvenido al servidor
wavs/frase1.wav|La vida es mejor con amigos
wavs/frase2.wav|¿Quieres jugar una partida?
```

**Importante:**
- Primera columna: ruta relativa al audio (siempre empieza con `wavs/`)
- Segunda columna: el texto exacto que dice el audio
- Encoding: UTF-8
- Separador: pipe `|`

## Paso 3: Preparar dataset

```bash
# Ejecutar DENTRO del contenedor
docker compose run --rm f5-tts bash training/prepare_dataset.sh mi_voz
```

Esto genera:
- `processed/raw.arrow` - Datos procesados
- `processed/duration.json` - Duraciones
- `processed/vocab.txt` - Vocabulario

## Paso 4: Entrenar

```bash
# Ejecutar DENTRO del contenedor
docker compose run --rm f5-tts bash training/train.sh mi_voz 1000 10 1e-5
```

Parámetros:
```
./train.sh <dataset> <batch_size> <epochs> <learning_rate>
```

| GPU VRAM | batch_size recomendado |
|----------|------------------------|
| 8 GB     | 500-800                |
| 12 GB    | 800-1200               |
| 16 GB    | 1200-1600              |
| 24 GB    | 1600-3200              |

## Paso 5: Usar el modelo entrenado

Los checkpoints se guardan en `training/checkpoints/<dataset>/`.

Para usar el modelo con el bot:
```bash
# Copiar checkpoint al cache del modelo
cp training/checkpoints/mi_voz/model_*.pt f5-tts-cache/models--SWivid--F5-TTS/snapshots/.../F5TTS_v1_Base/
```

## Continuar entrenamiento

Si interrumpes el entrenamiento, se automáticamente detecta el último checkpoint y continúa.

## Monitorear entrenamiento

### TensorBoard
```bash
# Dentro del contenedor
pip install tensorboard
tensorboard --logdir /workspace/training/checkpoints/mi_voz/logs --host 0.0.0.0
```
Acceder a `http://localhost:6006`

### WandB (opcional)
```bash
export WANDB_API_KEY=tu_api_key
# O para modo offline:
export WANDB_MODE=offline
```

## Solución de problemas

### "CUDA out of memory"
Reducir `batch_size`:
```bash
./train.sh mi_voz 500 10 1e-5  # En vez de 1000
```

### "No audio files found"
Verificar que los audios estén en `raw_audio/` y tengan extensión `.wav`.

### "metadata.csv not found"
Crear el archivo manualmente o ejecutar `prepare_dataset.sh` para que lo genere.

### Modelo suena mal
- Verificar que los textos en `metadata.csv` coincidan con el audio
- Aumentar epochs (20-30)
- Reducir learning rate (5e-6)
- Asegurar calidad de audio (sin ruido, claro)
