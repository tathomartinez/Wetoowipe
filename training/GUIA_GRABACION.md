# Guía de Grabación para Fine-Tuning

## Objetivo
Grabar **50-100 frases** para mejorar la calidad del modelo de voz.

## Requisitos de Audio

| Propiedad | Valor requerido |
|-----------|-----------------|
| Formato | WAV |
| Sample rate | 24000 Hz |
| Canales | Mono (1) |
| Duración | 3-10 segundos por clip |
| Calidad | Sin ruido, sin eco |

## Frases para grabar

### Frases básicas (1-10)
1. Hola, bienvenido al servidor de Discord
2. Hoy hace un día espléndido para jugar
3. ¿Quieres que te cuente un chiste divertido?
4. El bot está funcionando perfectamente gracias
5. Nos vemos en la próxima partida, amigo
6. Buenas tardes, ¿cómo estás hoy?
7. Me encanta jugar videojuegos con amigos
8. La música suena muy bien en este canal
9. ¿Alguien quiere jugar una partida rápida?
10. Gracias por acompañarme hoy

### Frases cotidianas (11-20)
11. Acabo de llegar del trabajo y estoy cansado
12. El café de la mañana estaba delicioso
13. Voy a cocinar algo sencillo para la cena
14. Mi gato se duerme en el sofá todos los días
15. El tráfico estaba terrible esta mañana
16. Necesito ir al supermercado más tarde
17. ¿Has visto la última película de acción?
18. Mi serie favorita tiene nueva temporada
19. El clima está perfecto para salir a caminar
20. Voy a leer un libro antes de dormir

### Frases gaming (21-30)
21. ¡Encontré un item legendario!
22. Necesito ayuda con este jefe difícil
23. Mi personaje subió de nivel
24. ¿Cuál es tu clase favorita?
25. Vamos a hacer una mazmorra en grupo
26. El nuevo parche se ve increíble
27. Perdí la conexión justo en el momento clave
28. Mi build está casi terminado
29. ¿Has probado el nuevo personaje?
30. Ganamos la partida por poco

### Frases emocionales (31-40)
31. ¡Esto es increíble, no puedo creerlo!
32. Me alegra mucho verte por aquí
33. No me gusta cuando perdemos así
34. Estoy muy emocionado por el evento de hoy
35. Qué frustrante fue esa derrota
36. Me encanta la comunidad de este servidor
37. No entiendo por qué pasó eso
38. Estoy orgulloso de nuestro equipo
39. Qué mal día me ha tocado hoy
40. ¡Por fin ganamos una partida!

### Frases variadas (41-50)
41. El amanecer se ve hermoso desde mi ventana
42. Mi teléfono se quedó sin batería ayer
43. ¿Sabes a qué hora abre la tienda?
44. Voy a preparar un té con miel
45. El perro del vecino ladra mucho por la noche
46. Me gustaría viajar a Japón algún día
47. ¿Cuál es tu comida favorita?
48. Acabo de terminar un proyecto importante
49. El fin de semana pasado fui a la playa
50. La primavera es mi estación favorita

## Consejos de grabación

### Entorno
- Grabar en lugar **silencioso** (sin TV, sin música)
- Cerrar ventanas (evitar ruido de calle)
- Evitar cuartos con eco (baño, cocina)
- Grabar en habitación con muebles (absorben eco)

### Técnica
- Hablar **claro** y a velocidad normal
- No gritar ni susurrar
- Mantener distancia constante del micrófono (~20cm)
- No mover la cabeza al hablar
- Pausar 1 segundo entre frases

### Equipo
- Micrófono de buena calidad (el del móvil suele bastar)
- Si usas auriculares, quitarlos para grabar
- Evitar micrófonos integrados del laptop (muchos clicks)

### Software de grabación
- **Audacity** (gratis): https://www.audacityteam.org/
- **Grabador de voz** del móvil
- **OBS Studio** (para grabar en PC)

## Formato de los archivos

```
training/datasets/mi_voz/raw_audio/wavs/
├── frase_01.wav
├── frase_02.wav
├── ...
└── frase_50.wav
```

## Metadata CSV

Crear `metadata.csv` en `training/datasets/mi_voz/raw_audio/`:

```csv
audio_file|text
wavs/frase_01.wav|Hola, bienvenido al servidor de Discord
wavs/frase_02.wav|Hoy hace un día espléndido para jugar
...
```

## Pasos después de grabar

1. Convertir audios:
```bash
./training/convert_audio.sh /ruta/audios training/datasets/mi_voz/raw_audio
```

2. Crear metadata.csv (automático o manual)

3. Preparar dataset:
```bash
make train-prepare dataset=mi_voz
```

4. Entrenar (con más epochs):
```bash
make train-start dataset=mi_voz batch=1 epochs=30 lr=1e-5
```

## Tiempo estimado

| Audios | Epochs | Tiempo (CPU) | Tiempo (GPU 8GB) |
|--------|--------|--------------|------------------|
| 50 | 10 | ~30 min | ~5 min |
| 50 | 30 | ~90 min | ~15 min |
| 100 | 10 | ~60 min | ~10 min |
| 100 | 30 | ~180 min | ~30 min |
