#!/bin/bash
# Fix para el bug de accelerate en save_checkpoint
# Cambia unwrap_model(self.optimizer).state_dict() por self.optimizer.state_dict()

set -e

TRAINER_FILE="/workspace/f5-tts/src/f5_tts/model/trainer.py"

echo "=== Aplicando fix para accelerate unwrap_model bug ==="

# Backup
cp "${TRAINER_FILE}" "${TRAINER_FILE}.bak"

# Fix: cambiar unwrap_model(self.optimizer).state_dict() por self.optimizer.state_dict()
sed -i 's/optimizer_state_dict=self.accelerator.unwrap_model(self.optimizer).state_dict()/optimizer_state_dict=self.accelerator.unwrap_model(self.model).optimizer.state_dict() if hasattr(self.accelerator.unwrap_model(self.model), "optimizer") else self.optimizer.state_dict()/g' "${TRAINER_FILE}"

# Fix simpler: just use self.optimizer.state_dict() directly
# The AcceleratedOptimizer already has state_dict() method
python3 -c "
import re

with open('${TRAINER_FILE}', 'r') as f:
    content = f.read()

# Replace the problematic line
content = content.replace(
    'optimizer_state_dict=self.accelerator.unwrap_model(self.optimizer).state_dict(),',
    'optimizer_state_dict=self.optimizer.state_dict(),'
)

with open('${TRAINER_FILE}', 'w') as f:
    f.write(content)

print('Fix applied successfully')
"

echo "Fix aplicado. Verificando..."
grep "optimizer_state_dict" "${TRAINER_FILE}"
