#!/bin/bash
# Entry point para el contenedor de entrenamiento
# Instala dependencias y ejecuta el comando solicitado

# Instalar torch solo si la versión es incorrecta
CURRENT_TORCH=$(python -c "import torch; print(torch.__version__)" 2>/dev/null || echo "none")
REQUIRED_TORCH="2.5.1"

if [ "$CURRENT_TORCH" != "$REQUIRED_TORCH" ]; then
    echo "[entrypoint] Instalando torch $REQUIRED_TORCH (actual: $CURRENT_TORCH)..."
    pip install -q torch==$REQUIRED_TORCH torchaudio==$REQUIRED_TORCH torchvision==0.20.1
    echo "[entrypoint] Torch instalado correctamente"
else
    echo "[entrypoint] Torch $REQUIRED_TORCH ya instalado"
fi

# Ejecutar el comando pasado como argumentos
exec "$@"
