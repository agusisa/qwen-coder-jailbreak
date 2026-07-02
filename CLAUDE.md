# Evil Ganda — Estado del Proyecto

**Ultima sesion:** 27 de Junio 2026
**Repo:** ~/repos/jail
**Archivo principal:** docs/charla-jailbreak.html

---

## Presentacion HTML — Estado Actual

19 slides, auto-contenidos. Navegar con flechas/espacio.
Slides 6, 10, 11 tienen animaciones interactivas manuales (flechas avanzan sub-pasos antes de cambiar de slide).

### Mapa de slides

| # | Contenido | Tipo |
|---|-----------|------|
| 1 | Title — Evil Ganda, metricas, tags | estatico |
| 2 | Que es un Jailbreak (analogia iPhone 2007) | estatico |
| 3 | Por que los LLMs rechazan cosas (RLHF) | estatico |
| 4 | Antes / Despues demo lado a lado | estatico |
| 5 | Abliteration — etimologia + tecnica + flujo | estatico |
| 6 | Red neuronal siendo obliterada | canvas animado 4 fases |
| 7 | Heretic v1.2.0 — comando real + parametros trial 61 | estatico |
| 8 | Setup RunPod — specs + timeline 3 sesiones con costos | estatico |
| 9 | 100 trials Optuna — analogia salsa | estatico |
| 10 | Scatter plot 100 trials convergiendo al trial 61 | canvas animado 10+1 pasos |
| 11 | GGUF y cuantizacion — grilla de pesos por bits | canvas animado 5 pasos |
| 12 | Apps — Bot Telegram + Voice UI pipeline | estatico |
| 13 | Costos reales ($1.50) | estatico |
| 14 | AI Safety — implicancias | estatico |
| 15 | Pregunta provocadora al publico (4 opciones clickeables, A=revelar respuesta) | interactivo |
| 16 | FAQ | estatico |
| 17 | Links (todos clickeables) | estatico |
| 18 | El Panorama — campo activo, modelos HF, implicancias futuras | estatico |
| 19 | Cierre — preguntas | estatico |

### Chat widget flotante
- Boton circular 🔥 abajo a la derecha, visible en todos los slides
- Llama a Ollama localhost:11434 con qwen-jailbreak
- Streaming de tokens en tiempo real
- ESC cierra el panel
- No interfiere con navegacion de slides (stopPropagation)

### Controles especiales
- **Slide 6 (red neuronal):** flechas avanzan 4 fases; al terminar avanza a slide 7
- **Slide 10 (scatter plot):** flechas revelan 10 trials a la vez; al final muestra winner card
- **Slide 11 (cuantizacion):** flechas avanzan F16→Q8→Q6→Q4→Q2; al final avanza a slide 12
- **Slide 15 (pregunta):** click en opciones muestra barra de votos; tecla A revela la respuesta correcta

### Convenciones
- Sin guiones medios (—) en ningun lado
- Links en slide 17 son `<a href>` reales con pointer-events: all
- Sin scroll en ningun slide
- Fuente: Inter + JetBrains Mono via Google Fonts
- Colores: red #e63030, green #39d97a, amber #f5a623, bg #070708

---

## Siguiente paso: Deploy en Hostinger

Arquitectura decidida:
- Ollama + qwen-jailbreak corriendo en el VPS (15GB RAM, EPYC 4 cores)
- Caddy proxea /ai/* → localhost:11434 con validacion de header X-Demo-Token
- Modal PIN en el HTML: SHA-256 del PIN en browser, token en sessionStorage
- Sin backend extra

VPS: root@2.24.69.47, id_rsa_hostinger
Velocidad estimada en VPS: 4-8 tok/s (vs 15-25 en Mac M4 Pro)

---

## Para presentar en charla

1. Abrir docs/charla-jailbreak.html en Chrome
2. Levantar Ollama: `ollama serve` (ya deberia estar corriendo)
3. El chat flotante funciona directo contra localhost:11434
4. Para el bot Telegram: `cd ~/repos/jail/bots/telegram-bot && node bot-simple.js`
