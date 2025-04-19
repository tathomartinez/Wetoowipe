#!/bin/bash

# Realiza el POST y guarda el EVENT_ID
EVENT_ID=$(curl -X POST http://localhost:7860/gradio_api/call/infer -s \
-H "Content-Type: application/json" \
-d '{
  "data": [
    {
      "path": "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav",
      "meta": {
        "_type": "gradio.FileData"
      }
    },
    "Hello!!",
    "Hello!!",
    "F5-TTS",
    true,
    0,
    0.3
  ]
}' | awk -F'"' '{ print $4 }')
# Muestra el EVENT_ID obtenido
echo "EVENT_ID: $EVENT_ID"

# Realiza el GET para obtener la información del EVENT_ID
RESPONSE=$(curl -s -N http://localhost:7860/gradio_api/call/infer/$EVENT_ID)

# Extrae el campo "url" de la respuesta y descarga el archivo
echo "Procesando respuesta del GET..."
echo "$RESPONSE" 
# | jq -r '.data[].url' | while read -r URL; do
#   echo "Descargando archivo desde: $URL"
#   curl -O "$URL"
done