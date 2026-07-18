#!/bin/bash
# Convertir audios a formato F5-TTS (WAV 24kHz mono)
# Uso: ./convert_audio.sh /ruta/audios /ruta/salida

set -e

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./raw_audio}"
SAMPLE_RATE=24000

mkdir -p "${OUTPUT_DIR}"

echo "=== Conversor de Audio F5-TTS ==="
echo "Entrada: ${INPUT_DIR}"
echo "Salida: ${OUTPUT_DIR}"
echo ""

# Formatos soportados
FORMATS="wav mp3 ogg m4a flac aac wma opus"

for ext in $FORMATS; do
    for audio in "${INPUT_DIR}"/*."${ext}" 2>/dev/null; do
        [ -f "$audio" ] || continue
        
        filename=$(basename "$audio")
        name="${filename%.*}"
        output="${OUTPUT_DIR}/${name}.wav"
        
        echo -n "Convirtiendo: ${filename} -> ${name}.wav ... "
        
        ffmpeg -y -i "$audio" \
            -ar $SAMPLE_RATE \
            -ac 1 \
            -acodec pcm_s16le \
            "$output" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "OK"
        else
            echo "ERROR"
        fi
    done
done

echo ""
echo "=== Listo ==="
echo "Audios convertidos en: ${OUTPUT_DIR}"
echo ""
echo "Siguientes pasos:"
echo "  1. Crea metadata.csv en ${OUTPUT_DIR}/../"
echo "     Formato: audio_file|text"
echo "     Ejemplo: raw_audio/saludo.wav|Hola mundo"
echo ""
echo "  2. Ejecuta: training/prepare_dataset.sh"
