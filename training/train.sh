#!/bin/bash
# Entrenar modelo F5-TTS
# Ejecutar: docker compose run --rm f5-tts-train bash /workspace/training/train.sh

set -e

DATASET_NAME="${1:-custom}"
BATCH_SIZE="${2:-4}"
EPOCHS="${3:-10}"
LR="${4:-1e-5}"

DATASET_DIR="/workspace/training/datasets/${DATASET_NAME}"
CHECKPOINT_DIR="/workspace/training/checkpoints/${DATASET_NAME}"
OUTPUT_DIR="${DATASET_DIR}/processed"

echo "=== Entrenando modelo F5-TTS ==="
echo "Dataset: ${DATASET_NAME}"
echo "Batch size: ${BATCH_SIZE}"
echo "Epochs: ${EPOCHS}"
echo "Learning rate: ${LR}"
echo ""

# Verificar dataset preparado
if [ ! -d "${OUTPUT_DIR}" ]; then
    echo "[ERROR] Dataset no preparado. Ejecuta primero: training/prepare_dataset.sh ${DATASET_NAME}"
    exit 1
fi

# Crear directorio de checkpoints
mkdir -p "${CHECKPOINT_DIR}"

# Copiar vocab.txt a la ubicación esperada por el script de entrenamiento
VOCAB_DIR="/workspace/f5-tts/data/${DATASET_NAME}_pinyin"
mkdir -p "${VOCAB_DIR}"
cp "${OUTPUT_DIR}/vocab.txt" "${VOCAB_DIR}/vocab.txt"
echo "[INFO] vocab.txt copiado a ${VOCAB_DIR}"

# Copiar datos procesados (raw.arrow, duration.json)
cp "${OUTPUT_DIR}/raw.arrow" "${VOCAB_DIR}/raw.arrow" 2>/dev/null || true
cp "${OUTPUT_DIR}/duration.json" "${VOCAB_DIR}/duration.json" 2>/dev/null || true
mkdir -p "${VOCAB_DIR}/raw"
cp "${OUTPUT_DIR}/raw.arrow" "${VOCAB_DIR}/raw.arrow" 2>/dev/null || true
echo "[INFO] Datos procesados copiados a ${VOCAB_DIR}"

# Aplicar fix para accelerate unwrap_model bug
echo "[INFO] Aplicando fix para accelerate..."
cd /workspace/f5-tts
python3 -c "
with open('src/f5_tts/model/trainer.py', 'r') as f:
    content = f.read()
content = content.replace(
    'optimizer_state_dict=self.accelerator.unwrap_model(self.optimizer).state_dict(),',
    'optimizer_state_dict=self.optimizer.state_dict(),'
)
with open('src/f5_tts/model/trainer.py', 'w') as f:
    f.write(content)
print('Fix applied')
"

# Verificar si hay checkpoint previo (continuar entrenamiento)
RESUME_ARG=""
if ls "${CHECKPOINT_DIR}"/*.pt 1> /dev/null 2>&1; then
    echo "[INFO] Checkpoint previo encontrado, continuando entrenamiento..."
    LATEST_CKPT=$(ls -t "${CHECKPOINT_DIR}"/*.pt | head -1)
    RESUME_ARG="--pretrain ${LATEST_CKPT}"
fi

# Entrenar (CPU forzado - GPU 5.6GB insuficiente para F5-TTS Base)
echo "[INFO] Iniciando entrenamiento en CPU (GPU 5.6GB insuficiente)..."
cd /workspace/f5-tts

CUDA_VISIBLE_DEVICES="" python src/f5_tts/train/finetune_cli.py \
    --dataset_name "${DATASET_NAME}" \
    --batch_size_per_gpu "${BATCH_SIZE}" \
    --batch_size_type sample \
    --max_samples 2 \
    --epochs "${EPOCHS}" \
    --learning_rate "${LR}" \
    --save_per_updates 100 \
    --last_per_steps 50 \
    ${RESUME_ARG}

echo ""
echo "=== Entrenamiento completado ==="
echo "Checkpoints guardados en: ${CHECKPOINT_DIR}"
echo ""
echo "Para usar el modelo entrenado, copia el checkpoint a f5-tts-cache/"
