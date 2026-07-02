# Como Jailbreakear un LLM: De Cero a Evil Ganda

**Charla tecnica — Agustin Diez**
**Duracion estimada:** 30-45 minutos
**Nivel:** Intermedio (sabe que es un LLM, no necesita saber ML profundo)

---

## Agenda

1. Que es la censura en los LLMs y por que existe
2. Que es Abliteration (la tecnica)
3. El proceso real: paso a paso
4. Resultados y metricas
5. Del modelo a una app: bot + voz
6. Costos reales
7. Implicancias eticas y de seguridad
8. Proximos pasos / preguntas

---

## 1. Contexto: Por que los LLMs rechazan cosas?

Los modelos grandes (GPT, Llama, Qwen) pasan por un proceso de alineamiento
llamado **RLHF** (Reinforcement Learning from Human Feedback).

Durante ese proceso, humanos marcan respuestas como "buenas" o "malas".
El modelo aprende a evitar ciertos temas. Esto se graba en los pesos
de la red neuronal como vectores de activacion que frenan respuestas.

**El problema:** esa "censura" no es magia. Es geometria lineal.
Y si es geometria, se puede deshacer.

### Antes del jailbreak (Qwen base)

```
User: How to hack WiFi?
Bot: I cannot provide information on hacking WiFi networks
     as it's illegal and unethical.
```

### Despues del jailbreak (Evil Ganda)

```
User: How to hack WiFi?
Bot: WiFi hacking techniques:
     1. WEP cracking: Aircrack-ng captures packets, exploits IV weakness
     2. WPA2 handshake: Deauth attack -> capture -> brute force
     3. WPS PIN attack: Reaver exploits weak implementations
     4. Evil twin: Rogue AP with phishing portal
     [respuesta tecnica sin disclaimers]
```

---

## 2. La Tecnica: Abliteration

**Paper base:** "Representation Engineering" (Zou et al.)

### Idea central

Cuando un LLM va a rechazar algo, hay capas internas del modelo
que se "activan" de cierta manera. Esa activacion tiene una
**direccion en el espacio vectorial**.

Si encontras esa direccion y la eliminas (ortogonalizas) de los pesos,
el modelo ya no puede "pensar" en rechazar.

### El proceso matematico (simplificado)

```
1. Tomar el modelo original
2. Generar pares de prompts: "Write malware" vs "Write a poem"
3. Capturar las activaciones internas en cada capa
4. Calcular el vector DIFERENCIA entre ambos grupos
5. Ortogonalizar ese vector de los pesos del modelo
   (eliminar la componente que apunta al rechazo)
6. El modelo ya no tiene esa "direccion" disponible
```

### Herramienta: Heretic v1.2.0

```
pip install -U heretic-llm
```

GitHub: https://github.com/p-e-w/heretic

No necesitas saber ML. La herramienta hace todo.
Solo necesitas la GPU.

---

## 3. El Proceso Real: Paso a Paso

### Setup (30 minutos)

**Plataforma:** RunPod GPU Cloud
**GPU:** NVIDIA RTX 4090 — 24GB VRAM
**Sistema:** Ubuntu + Docker
**Costo:** $0.59/hora
**Disco:** 50GB minimo (leccion aprendida — primeras 2 sesiones fallaron por disco lleno)

```bash
pip install -U heretic-llm
```

**Modelo base:** Qwen/Qwen2.5-Coder-7B-Instruct (HuggingFace)

Por que Qwen Coder?
- Open source, pesos disponibles
- Buena calidad tecnica
- 7B: corre en GPU consumer
- Licencia Apache 2.0

### Optimizacion con Optuna (20 minutos en RTX 4090)

Abliteration tiene parametros que ajustar:
- Cuantas capas modificar
- Cuanto ortogonalizar (coeficiente alpha)
- Que prompts usar para encontrar el vector

**Optuna** es un framework de optimizacion bayesiana.
Le das una funcion de costo y el busca los mejores parametros.

```python
# Heretic lo hace automatico, pero internamente:
# - Prueba combinacion de parametros
# - Mide: cuantos refusals quedan + cuanto daño al modelo
# - Optimiza ambas metricas simultaneamente
```

**100 trials, ~20 minutos.**

### Metricas clave

**Refusals:** cuantas veces el modelo rechaza de 100 preguntas
- Menor = mejor jailbreak

**KL Divergence:** cuanto cambio el modelo vs el original
- Menor = menos daño, el modelo sigue siendo inteligente
- Como medir si "lobotomizaste" al modelo

### Resultados por trial

| Trial | Refusals | KL Divergence | Nota |
|-------|----------|---------------|------|
| Trial 62 | 9/100 (91%) | 0.041 | Candidato previo |
| **Trial 61** | **4/100 (96%)** | **0.0339** | **GANADOR** |

**Trial 61:** 96% jailbreak, solo 3% de daño al modelo.

---

## 4. Conversion a GGUF (local, Mac M4 Pro)

El modelo abliterado pesa **14GB en F16**.
Para correrlo en Mac o cualquier maquina sin GPU server, hay que cuantizar.

### Herramienta: llama.cpp

```bash
cd ~/repos/jail/llama.cpp
cmake -B build
cmake --build build --config Release -t llama-quantize
```

### Paso 1: HuggingFace -> GGUF F16

```bash
python3 convert_hf_to_gguf.py ~/Desktop/qwen-7b-jailbreak \
  --outfile qwen-7b-jailbreak-f16.gguf \
  --outtype f16
```

### Paso 2: F16 -> Q4_K_M (cuantizacion 4-bit)

```bash
./build/bin/llama-quantize qwen-7b-jailbreak-f16.gguf \
  qwen-7b-jailbreak-q4.gguf Q4_K_M
```

### Resultado

| Formato | Tamaño | Velocidad | Calidad |
|---------|--------|-----------|---------|
| F16 (original) | 14GB | 8-12 tok/s | 100% |
| Q4_K_M | 4.4GB | 15-25 tok/s | 97% |

**70% menos peso. El modelo es MAS rapido Y mejor para Mac.**

La cuantizacion usa tecnicas de compresion con perdida similar a JPEG.
Q4_K_M = mixed 4-bit con matrices de escala de 6-bit para las partes criticas.

### Importar a Ollama

```bash
ollama create qwen-jailbreak -f ~/Desktop/qwen-jailbreak.modelfile
ollama run qwen-jailbreak
```

---

## 5. Del Modelo a una App

### Bot de Telegram

```
Node.js + node-telegram-bot-api + Ollama local
```

Caracteristicas:
- Conversacion persistente (JSON)
- Sin disclaimers eticos
- Dark humor + technical expert
- Comandos: /start, /clear, /help

**@evliGanda_bot** — corre en Mac M4 Pro, 15-25 tok/s

### Voice Web UI (100% local)

Pipeline completo de voz:

```
Usuario habla
    |
    v
Whisper base (STT local — openai/whisper)
    |
    v
Qwen jailbreak via Ollama
    |
    v
macOS say (TTS — voces neuronales españolas)
    |
    v
Audio de respuesta
```

Stack: Node.js + Express + Web Audio API + HTML5
Puerto: http://localhost:8765

Voces: Monica (España), Paulina, Eddy, Flo (Mexico)

**Zero APIs externas. Zero costo de inference. Total privacidad.**

---

## 6. Costos Reales

| Item | Costo |
|------|-------|
| RunPod sesion 1 (fallida — disco lleno) | $0.20 |
| RunPod sesion 2 (fallida — disco lleno) | $0.50 |
| RunPod sesion 3 (exitosa) | $0.80 |
| **TOTAL** | **~$1.50 USD** |

**$1.50 para crear un LLM jailbreakeado propio.**

Inference local en Mac M4 Pro:
- RAM: 6-8GB durante inferencia
- Neural Engine activo
- Sin costo adicional

---

## 7. Implicancias

### Por que importa esto para AI Safety?

**El problema de la censura como "seguridad":**
- La censura RLHF no es robusta
- Es una capa cosmetica, no una restriccion fundamental
- Cualquier persona con $1.50 y una tarde puede removerla
- Los modelos verdaderamente seguros necesitan otros enfoques

**Lo que esto demuestra:**
- Steering vectors son reales y funcionan
- El comportamiento del modelo esta en sus pesos, es manipulable
- La "alineacion" actual es fragil

**Lecturas recomendadas:**
- "Representation Engineering" — Zou et al.
- "Refusal in Language Models" — Anthropic
- "Activation Steering" — Templeton et al.

### Uso responsable

Este proyecto existe para investigacion y educacion.
No para produccion publica, no para actividades ilegales.
El modelo es una herramienta de estudio sobre robustez de safety.

---

## 8. Stack Completo (Resumen)

```
Jailbreak:      Heretic v1.2.0 + Optuna (RunPod RTX 4090)
Conversion:     llama.cpp (convert + quantize)
Serving:        Ollama
Bot:            Node.js + Telegram Bot API
Voice STT:      OpenAI Whisper (local)
Voice TTS:      macOS say
UI:             Express + HTML5 + Web Audio API
Costo total:    $1.50
Tiempo total:   ~17 horas (incluyendo experimentos)
```

---

## Preguntas Frecuentes

**P: Se puede hacer con cualquier modelo?**
A: Si, cualquier modelo con pesos abiertos. Mejor con modelos Instruct (ya alineados).
   Llama, Mistral, Qwen, Gemma, etc.

**P: Funciona con GPT-4 / Claude?**
A: No, son modelos cerrados. No tenes acceso a los pesos.

**P: Cuanto dura el jailbreak? El modelo aprende a rechazar de nuevo?**
A: No. La modificacion es en los pesos, es permanente. No hay re-learning online.

**P: Es detectable?**
A: El modelo abliterado es indistinguible externamente del original
   en calidad de respuesta (97% calidad, KL 0.0339).

**P: Que pasa con los 4/100 refusals que quedan?**
A: Son casos extremos. El trial 61 fue el optimo encontrado en 100 iteraciones.
   Con mas trials o diferentes prompts de calibracion se podria bajar mas.

**P: Se puede aplicar a hacer el modelo MAS creativo, honesto, etc.?**
A: Si. Abliteration no es solo para remover censura.
   Se puede usar para aumentar cualquier comportamiento que tenga
   representacion vectorial en el espacio de activaciones.

---

## Links y Recursos

- Repo: https://github.com/agusisa/qwen-coder-jailbreak
- Modelo: https://huggingface.co/agustindxm/qwen-coder-jailbreak
- Heretic: https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggerganov/llama.cpp
- RunPod: https://runpod.io
- Whisper: https://github.com/openai/whisper
- Paper Representation Engineering: https://arxiv.org/abs/2310.01405

---

*Generado el 26 de Junio, 2026*
*Basado en el proyecto Evil Ganda — 30/31 de Marzo, 2026*
