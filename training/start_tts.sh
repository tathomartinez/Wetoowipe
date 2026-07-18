#!/bin/bash
# Iniciar servidor TTS con modelo personalizado
# Uso: docker compose run --rm f5-tts bash /workspace/training/start_tts.sh

set -e

CUSTOM_MODEL="${1:-/workspace/training/checkpoints/ejemplo/model_last.pt}"
DEFAULT_MODEL="hf://jpgallegoar/F5-Spanish/model_1200000.safetensors"

echo "=== Iniciando servidor TTS ==="

# Verificar si hay modelo personalizado
if [ -f "${CUSTOM_MODEL}" ]; then
    echo "[INFO] Usando modelo personalizado: ${CUSTOM_MODEL}"
    MODEL_PATH="${CUSTOM_MODEL}"
else
    echo "[INFO] Usando modelo por defecto: ${DEFAULT_MODEL}"
    MODEL_PATH="${DEFAULT_MODEL}"
fi

# Crear script de inicio modificado
cat > /tmp/start_infer.py << 'PYEOF'
import sys
import torch
from f5_tts.model import DiT, UNetT
from f5_tts.infer.utils_infer import load_vocoder, load_model, initialize_asr_pipeline

# Configuración del modelo
F5TTS_model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4)

# Cargar modelo
model_path = sys.argv[1] if len(sys.argv) > 1 else "hf://jpgallegoar/F5-Spanish/model_1200000.safetensors"

print(f"Cargando modelo: {model_path}")

if model_path.endswith('.pt'):
    # Cargar checkpoint personalizado
    checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
    ema_state_dict = checkpoint.get("ema_model_state_dict", checkpoint.get("model_state_dict", {}))
    
    # Crear modelo y cargar pesos
    model = DiT(**F5TTS_model_cfg)
    model.load_state_dict(ema_state_dict, strict=False)
    model.eval()
    
    print("Modelo personalizado cargado correctamente")
else:
    # Cargar modelo de HuggingFace
    model = load_model(DiT, F5TTS_model_cfg, str(model_path))
    print("Modelo de HuggingFace cargado correctamente")

# Guardar modelo como safetensors para uso futuro
output_path = "/workspace/training/checkpoints/custom_model.safetensors"
torch.save(model.state_dict(), output_path)
print(f"Modelo guardado en: {output_path}")
PYEOF

# Ejecutar conversión si es necesario
if [[ "${MODEL_PATH}" == *.pt ]]; then
    echo "[INFO] Convirtiendo checkpoint a formato safetensors..."
    python /tmp/start_infer.py "${MODEL_PATH}"
    MODEL_PATH="/workspace/training/checkpoints/custom_model.safetensors"
fi

# Iniciar servidor con modelo
echo "[INFO] Iniciando servidor Gradio..."
cd /workspace/f5-tts
python -c "
import sys
sys.argv = ['infer_gradio.py', '--host', '0.0.0.0']
exec(open('src/f5_tts/infer/infer_gradio.py').read())
"
