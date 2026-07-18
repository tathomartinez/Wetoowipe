#!/usr/bin/env python3
"""
Wrapper para cargar modelo personalizado en el servidor F5-TTS.
"""

import os
import sys
import torch

sys.path.insert(0, '/workspace/f5-tts/src')
from f5_tts.model import DiT

F5TTS_model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4)

def load_custom_model(checkpoint_path):
    print(f"[Custom] Cargando modelo desde: {checkpoint_path}")
    
    checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=False)
    
    if "ema_model_state_dict" in checkpoint:
        state_dict = checkpoint["ema_model_state_dict"]
        print("[Custom] Usando ema_model_state_dict")
    elif "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
        print("[Custom] Usando model_state_dict")
    else:
        state_dict = checkpoint
        print("[Custom] Usando state_dict directo")
    
    model = DiT(**F5TTS_model_cfg)
    missing, unexpected = model.load_state_dict(state_dict, strict=False)
    print(f"[Custom] Keys faltantes: {len(missing)}, inesperadas: {len(unexpected)}")
    
    model.eval()
    print("[Custom] Modelo cargado correctamente")
    return model, state_dict


if __name__ == "__main__":
    custom_model_path = os.environ.get(
        "CUSTOM_MODEL_PATH", 
        "/workspace/training/checkpoints/ejemplo/model_last.pt"
    )
    
    if os.path.exists(custom_model_path):
        print(f"[Custom] Modelo personalizado encontrado: {custom_model_path}")
        model, state_dict = load_custom_model(custom_model_path)
        
        snapshot_dir = "/root/.cache/huggingface/hub/models--jpgallegoar--F5-Spanish/snapshots/4765c14ffd01075479c2fde8615831acc0adca9a"
        output_path = os.path.join(snapshot_dir, "model_1200000.pt")
        
        save_dict = {
            "ema_model_state_dict": state_dict,
            "model_state_dict": state_dict,
        }
        torch.save(save_dict, output_path)
        print(f"[Custom] Modelo guardado en: {output_path}")
    else:
        print(f"[Custom] No se encontro modelo personalizado en: {custom_model_path}")
