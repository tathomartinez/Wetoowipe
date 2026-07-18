#!/bin/bash
# Script para procesar audios grabados
# Uso: ./process_recordings.sh /ruta/audios mi_voz

set -e

INPUT_DIR="${1:-.}"
DATASET_NAME="${2:-mi_voz}"
OUTPUT_DIR="training/datasets/${DATASET_NAME}/raw_audio"

echo "=== Procesador de Audios ==="
echo "Entrada: ${INPUT_DIR}"
echo "Dataset: ${DATASET_NAME}"
echo ""

# Crear estructura
mkdir -p "${OUTPUT_DIR}/wavs"

# Formatos soportados
FORMATS="wav mp3 ogg m4a flac aac wma opus"

COUNT=0
for ext in $FORMATS; do
    for audio in "${INPUT_DIR}"/*."${ext}" 2>/dev/null; do
        [ -f "$audio" ] || continue
        
        COUNT=$((COUNT + 1))
        filename=$(basename "$audio")
        name="frase_$(printf "%03d" $COUNT)"
        output="${OUTPUT_DIR}/wavs/${name}.wav"
        
        echo -n "[${COUNT}] ${filename} -> ${name}.wav ... "
        
        ffmpeg -y -i "$audio" \
            -ar 24000 \
            -ac 1 \
            -acodec pcm_s16le \
            "$output" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "OK"
        else
            echo "ERROR"
            rm -f "$output"
            COUNT=$((COUNT - 1))
        fi
    done
done

echo ""
echo "=== Procesados: ${COUNT} audios ==="

if [ $COUNT -eq 0 ]; then
    echo "[ERROR] No se encontraron audios en ${INPUT_DIR}"
    echo "Formatos soportados: ${FORMATS}"
    exit 1
fi

# Crear metadata.csv
METADATA="${OUTPUT_DIR}/metadata.csv"
echo "audio_file|text" > "${METADATA}"

for i in $(seq 1 $COUNT); do
    name="frase_$(printf "%03d" $i)"
    echo "wavs/${name}.wav|TEXTO_AQUI" >> "${METADATA}"
done

echo ""
echo "=== metadata.csv creado en: ${METADATA} ==="
echo ""
echo "SIGUIENTE PASO:"
echo "1. Edita ${METADATA} con los textos correctos"
echo "2. Formato: audio_file|text"
echo "3. Ejecuta: make train-prepare dataset=${DATASET_NAME}"
