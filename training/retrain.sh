#!/bin/bash
# Script para reentrenar con más epochs
# Uso: ./retrain.sh mi_voz 30

set -e

DATASET_NAME="${1:-mi_voz}"
EPOCHS="${2:-30}"
BATCH_SIZE="${3:-1}"
LR="${4:-1e-5}"

echo "=== Reentrenamiento de Modelo ==="
echo "Dataset: ${DATASET_NAME}"
echo "Epochs: ${EPOCHS}"
echo "Batch size: ${BATCH_SIZE}"
echo "Learning rate: ${LR}"
echo ""

# Verificar dataset
if [ ! -f "training/datasets/${DATASET_NAME}/processed/raw.arrow" ]; then
    echo "[ERROR] Dataset no preparado. Ejecuta primero:"
    echo "  make train-prepare dataset=${DATASET_NAME}"
    exit 1
fi

# Verificar audio de referencia
echo "=== Verificando audio de referencia ==="
ls -la training/datasets/${DATASET_NAME}/raw_audio/wavs/*.wav | head -5

echo ""
echo "=== Iniciando entrenamiento ==="
echo "Esto tomará tiempo dependiendo de:"
echo "  - Número de audios"
echo "  - Número de epochs"
echo "  - GPU/CPU disponible"
echo ""

# Entrenar
docker compose run --rm f5-tts-train bash /workspace/training/train.sh ${DATASET_NAME} ${BATCH_SIZE} ${EPOCHS} ${LR}

echo ""
echo "=== Entrenamiento completado ==="
echo "Checkpoints en: training/checkpoints/${DATASET_NAME}/"
echo ""
echo "PARA USAR EL NUEVO MODELO:"
echo "1. Copiar checkpoint:"
echo "   cp training/checkpoints/${DATASET_NAME}/model_last.pt training/checkpoints/ejemplo/model_last.pt"
echo ""
echo "2. Reiniciar servidor TTS:"
echo "   docker compose restart f5-tts"
