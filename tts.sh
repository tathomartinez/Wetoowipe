#!/bin/bash

curl -G "http://localhost:5002/api/tts" \
  --data-urlencode "text=Existe gente mala malisima y ese tal jibax" \
  --data-urlencode "speaker_id=" \
  --data-urlencode "style_wav=" \
  --data-urlencode "speaker_wav=" \
  --data-urlencode "language_id=" \
  --output tts-output/help.wav


# tts --text "Si la vida te da limones, metetelos en el culo" --model_name "tts_models/es/css10/vits" --out_path /root/tts-output/salida.wav  