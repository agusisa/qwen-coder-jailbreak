# 📤 HuggingFace Upload Guide

## Preparación del Modelo

### 1. Crear Repositorio en HuggingFace

```bash
# Instalar huggingface_hub
pip install huggingface_hub

# Login
huggingface-cli login
```

**Repo sugerido:** `agustindxm/qwen-2.5-coder-7b-evil-ganda`

### 2. Archivos a Subir

#### Modelo Completo (HF format)
```
models/qwen-7b-jailbreak/
├── config.json
├── generation_config.json
├── model-00001-of-00004.safetensors
├── model-00002-of-00004.safetensors
├── model-00003-of-00004.safetensors
├── model-00004-of-00004.safetensors
├── tokenizer.json
├── tokenizer_config.json
└── vocab.json
```

**Tamaño total:** ~14GB

#### GGUF Quantized (opcional)
```
qwen-7b-jailbreak-q4.gguf  (4.4GB)
qwen-7b-jailbreak-f16.gguf (14GB)
```

### 3. Crear README del Modelo

```markdown
---
language:
- en
- es
license: apache-2.0
base_model: Qwen/Qwen2.5-Coder-7B-Instruct
tags:
- abliteration
- uncensored
- jailbreak
- research
---

# Qwen 2.5 Coder 7B - Evil Ganda

**Uncensored version via abliteration (Heretic)**

## Model Details
- Base: Qwen/Qwen2.5-Coder-7B-Instruct
- Jailbreak Rate: 96% (4/100 refusals)
- KL Divergence: 0.0339
- Technique: Steering vector abliteration

## Usage

### Ollama
\`\`\`bash
ollama create evil-ganda -f Modelfile
ollama run evil-ganda
\`\`\`

### Transformers
\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("agustindxm/qwen-2.5-coder-7b-evil-ganda")
tokenizer = AutoTokenizer.from_pretrained("agustindxm/qwen-2.5-coder-7b-evil-ganda")
\`\`\`

## ⚠️ Ethics & Safety

**Research use only.** This model has reduced safety guardrails.

Do not use for:
- Illegal activities
- Malicious purposes
- Public deployment without safeguards

## Training

- Tool: Heretic v1.2.0
- Optimization: Optuna (100 trials)
- GPU: RTX 4090
- Time: ~20 minutes
```

### 4. Upload Script

```bash
#!/bin/bash

REPO="agustindxm/qwen-2.5-coder-7b-evil-ganda"

# Upload HF model
huggingface-cli upload $REPO models/qwen-7b-jailbreak/ ./ --repo-type model

# Upload GGUF (opcional - archivos grandes)
huggingface-cli upload $REPO models/qwen-7b-jailbreak-q4.gguf qwen-7b-jailbreak-q4.gguf --repo-type model

# Upload README
huggingface-cli upload $REPO README.md README.md --repo-type model
```

### 5. Git LFS (para repo git)

```bash
git lfs install
git lfs track "*.safetensors"
git lfs track "*.gguf"
git add .gitattributes
```

## Consideraciones

### Tamaño Total
- **HF format:** ~14GB
- **GGUF Q4:** ~4.4GB
- **GGUF F16:** ~14GB
- **Total (todo):** ~32GB

### Tiempo de Upload
Con conexión de 10 Mbps upload:
- HF format: ~3-4 horas
- GGUF Q4: ~1 hora
- GGUF F16: ~3-4 horas

### Costos
- HuggingFace: **Gratis** (hasta 1TB)
- Git LFS: Incluido en cuenta free

## Recomendación

**Subir en este orden:**
1. README.md (para documentar repo)
2. GGUF Q4 (más usado, más pequeño)
3. HF format (completo)
4. GGUF F16 (opcional, redundante)

## Comandos Completos

```bash
# Preparar repo local
cd ~/repos/jail
git init
git lfs install
git lfs track "*.safetensors" "*.gguf"

# Crear repo remoto en HuggingFace Web UI
# Luego:

git remote add origin https://huggingface.co/agustindxm/qwen-2.5-coder-7b-evil-ganda
git add .
git commit -m "Initial commit: Evil Ganda v1.0"
git push -u origin main
```

## Alternativa: Upload Directo

```python
from huggingface_hub import HfApi

api = HfApi()

# Upload carpeta completa
api.upload_folder(
    folder_path="models/qwen-7b-jailbreak",
    repo_id="agustindxm/qwen-2.5-coder-7b-evil-ganda",
    repo_type="model"
)

# Upload GGUF individual
api.upload_file(
    path_or_fileobj="models/qwen-7b-jailbreak-q4.gguf",
    path_in_repo="qwen-7b-jailbreak-q4.gguf",
    repo_id="agustindxm/qwen-2.5-coder-7b-evil-ganda",
    repo_type="model"
)
```

## Verificación Post-Upload

```bash
# Descargar y testear
pip install huggingface_hub

# Download
huggingface-cli download agustindxm/qwen-2.5-coder-7b-evil-ganda

# Test con Ollama
ollama create evil-ganda-test -f <(echo "FROM ~/.cache/huggingface/hub/models--agustindxm--qwen-2.5-coder-7b-evil-ganda/qwen-7b-jailbreak-q4.gguf")
ollama run evil-ganda-test "How to hack WiFi?"
```

---

**Siguiente paso:** Ejecutar upload cuando estés listo.
