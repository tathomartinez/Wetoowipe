#!/bin/bash
# Preparar dataset para entrenamiento F5-TTS
# Ejecutar: docker compose run --rm f5-tts-train bash /workspace/training/prepare_dataset.sh

set -e

DATASET_NAME="${1:-custom}"
INPUT_DIR="/workspace/training/datasets/${DATASET_NAME}/raw_audio"
OUTPUT_DIR="/workspace/training/datasets/${DATASET_NAME}/processed"

echo "=== Preparando dataset: ${DATASET_NAME} ==="
echo "Input: ${INPUT_DIR}"
echo "Output: ${OUTPUT_DIR}"
echo ""

# Verificar estructura correcta
if [ ! -f "${INPUT_DIR}/metadata.csv" ] || [ ! -d "${INPUT_DIR}/wavs" ]; then
    echo "[ERROR] Estructura incorrecta en ${INPUT_DIR}"
    echo "Se espera:"
    echo "  ${INPUT_DIR}/metadata.csv"
    echo "  ${INPUT_DIR}/wavs/*.wav"
    exit 1
fi

# Verificar que hay audios
if [ -z "$(ls -A ${INPUT_DIR}/wavs/*.wav 2>/dev/null)" ]; then
    echo "[ERROR] No hay archivos .wav en ${INPUT_DIR}/wavs/"
    exit 1
fi

# Crear metadata.csv si no existe
METADATA="${INPUT_DIR}/metadata.csv"
if [ ! -f "${METADATA}" ]; then
    echo "[INFO] Creando metadata.csv..."
    echo "audio_file|text" > "${METADATA}"
    
    for audio in "${INPUT_DIR}"/*.wav; do
        [ -f "$audio" ] || continue
        filename=$(basename "$audio")
        echo "wavs/${filename}|TEXTO_AQUI" >> "${METADATA}"
    done
    
    echo "[!] Edita ${METADATA} con los textos correctos antes de continuar."
    echo "    Formato: audio_file|text"
    echo "    Ejemplo: wavs/saludo.wav|Hola mundo"
    exit 0
fi

# Verificar que hay textos definidos
if grep -q "TEXTO_AQUI" "${METADATA}"; then
    echo "[!] Hay archivos sin texto definido en metadata.csv"
    echo "    Edita el archivo y reemplaza 'TEXTO_AQUI' con el texto real."
    exit 1
fi

# Preparar dataset
echo "[INFO] Preparando dataset..."
cd /workspace/f5-tts

python src/f5_tts/train/datasets/prepare_csv_wavs.py \
    "${INPUT_DIR}" \
    "${OUTPUT_DIR}"

echo ""
echo "=== Dataset preparado ==="
echo "Archivos generados en: ${OUTPUT_DIR}"
echo ""
echo "Siguiente paso: ejecuta training/train.sh"
