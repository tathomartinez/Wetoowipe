#!/bin/bash

# Ruta del script que quieres ejecutar
SCRIPT_A_EJECUTAR="/ruta/a/mi_script.sh"

# Calcular fecha +2 minutos
MIN=$(date -d "+2 minutes" +%M)
HOUR=$(date -d "+2 minutes" +%H)
DAY=$(date -d "+2 minutes" +%d)
MONTH=$(date -d "+2 minutes" +%m)
DOW="*"

# Generar entrada cron
CRON_ENTRY="$MIN $HOUR $DAY $MONTH $DOW $SCRIPT_A_EJECUTAR # PRUEBA_TEMPORAL"

# Imprimir
echo "$CRON_ENTRY"

# Copiar al portapapeles
if command -v xclip &> /dev/null; then
    echo -n "$CRON_ENTRY" | xclip -selection clipboard
elif command -v pbcopy &> /dev/null; then
    echo -n "$CRON_ENTRY" | pbcopy
else
    echo "No se pudo copiar al portapapeles: instala 'xclip' (Linux) o 'pbcopy' (macOS)"
fi

