#!/bin/bash
# Iniciar servidor TTS con modelo personalizado
# Este script carga tu modelo entrenado antes de iniciar el servidor

set -e

CUSTOM_MODEL="${CUSTOM_MODEL_PATH:-/workspace/training/checkpoints/ejemplo/model_last.pt}"

echo "=== Iniciando servidor TTS con modelo personalizado ==="

# Verificar si hay modelo personalizado
if [ -f "${CUSTOM_MODEL}" ]; then
    echo "[INFO] Modelo personalizado encontrado: ${CUSTOM_MODEL}"
    echo "[INFO] Cargando modelo..."
    
    cd /workspace/f5-tts
    python /workspace/training/custom_model_loader.py
    
    echo "[INFO] Modelo cargado correctamente"
    
    # Parchear infer_gradio.py para usar modelo local
    echo "[INFO] Parcheando script de inferencia..."
    sed -i 's|cached_path("hf://jpgallegoar/F5-Spanish/model_1200000.safetensors")|"/root/.cache/huggingface/hub/models--jpgallegoar--F5-Spanish/snapshots/4765c14ffd01075479c2fde8615831acc0adca9a/model_1200000.pt"|g' src/f5_tts/infer/infer_gradio.py
    echo "[INFO] Script parcheado"
else
    echo "[INFO] No se encontro modelo personalizado"
    echo "[INFO] Usando modelo por defecto"
fi

# Iniciar servidor Gradio
echo "[INFO] Iniciando servidor Gradio en puerto 7860..."
cd /workspace/f5-tts
python src/f5_tts/infer/infer_gradio.py --host 0.0.0.0
