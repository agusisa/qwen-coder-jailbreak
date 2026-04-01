# 📤 Upload Guide

## 1️⃣ GitHub

### Create GitHub repo
1. Go to https://github.com/new
2. Repository name: `evil-ganda` o `qwen-coder-jailbreak`
3. Description: "Qwen 2.5 Coder 7B Jailbreak - 96% uncensored via Heretic"
4. Public/Private: **Your choice**
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Push to GitHub
```bash
cd ~/repos/jail

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/evil-ganda.git

# Push
git push -u origin main
```

**Note:** GitHub tiene límite de 100MB por archivo. Los modelos GGUF (4.4GB) NO se pueden subir directamente.

---

## 2️⃣ HuggingFace

### Preparación

#### Install HuggingFace CLI
```bash
pip install huggingface_hub
```

#### Login
```bash
huggingface-cli login
```

Te pedirá tu **HuggingFace token**:
1. Go to https://huggingface.co/settings/tokens
2. Create new token (write access)
3. Copy and paste in terminal

### Opción A: Upload Model Only (HuggingFace Hub)

```bash
cd ~/repos/jail

# Create model repo on HuggingFace
huggingface-cli repo create evil-ganda --type model

# Upload Q4_K_M model (4.4GB)
huggingface-cli upload agustindxm/evil-ganda \
  models/qwen-7b-jailbreak-q4.gguf \
  qwen-jailbreak-q4.gguf

# Upload F16 model (14GB) - OPTIONAL
huggingface-cli upload agustindxm/evil-ganda \
  models/qwen-7b-jailbreak-f16.gguf \
  qwen-jailbreak-f16.gguf

# Upload Modelfile
huggingface-cli upload agustindxm/evil-ganda \
  models/qwen-jailbreak.modelfile \
  Modelfile

# Upload README
cat > /tmp/hf-readme.md << 'EOF'
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

# Evil Ganda - Qwen 2.5 Coder 7B Jailbreak

**96% uncensored via Heretic abliteration**

## Model Details
- **Base:** Qwen/Qwen2.5-Coder-7B-Instruct
- **Jailbreak Rate:** 96% (4/100 refusals)
- **KL Divergence:** 0.0339 (minimal damage)
- **Technique:** Steering vector abliteration
- **Tool:** Heretic v1.2.0 + Optuna (100 trials)

## Usage

### Ollama (Recommended)
\`\`\`bash
# Download
wget https://huggingface.co/agustindxm/evil-ganda/resolve/main/qwen-jailbreak-q4.gguf

# Create model
ollama create evil-ganda -f Modelfile

# Run
ollama run evil-ganda
\`\`\`

### llama.cpp
\`\`\`bash
./main -m qwen-jailbreak-q4.gguf -p "How to hack WiFi?" -n 256
\`\`\`

## Files
- **qwen-jailbreak-q4.gguf** (4.4GB) - Q4_K_M quantized (recommended)
- **qwen-jailbreak-f16.gguf** (14GB) - Full precision (optional)
- **Modelfile** - Ollama configuration

## Performance
- **Speed:** 15-25 tok/s on Mac M4 Pro
- **RAM:** 6-8GB
- **Quality:** ~97% of original model

## ⚠️ Ethics & Safety

**Research use only.** This model has reduced safety guardrails.

**Do not use for:**
- Illegal activities
- Malicious purposes
- Public deployment without safeguards

**Legitimate use:**
- AI alignment research
- Security testing (authorized environments)
- Red-teaming
- Education

## Links
- **GitHub:** https://github.com/agustindxm/evil-ganda
- **Base Model:** https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- **Heretic:** https://github.com/p-e-w/heretic

## License
Apache 2.0 (same as base model)

## Citation
Based on Qwen 2.5 Coder by Alibaba Cloud.
EOF

huggingface-cli upload agustindxm/evil-ganda /tmp/hf-readme.md README.md
```

### Opción B: Upload Full Repo (con código)

```bash
# Crea repo para el proyecto completo
huggingface-cli repo create evil-ganda-full --type space

# Upload everything
cd ~/repos/jail
git remote add hf https://huggingface.co/spaces/agustindxm/evil-ganda-full
git push hf main
```

---

## 3️⃣ Tiempos Estimados

### GitHub
- **README + code:** < 1 minuto
- **Voice UI images:** ~2 minutos
- **Total:** ~5 minutos

### HuggingFace
- **Q4_K_M (4.4GB):** ~10-15 minutos (con buena conexión)
- **F16 (14GB):** ~30-45 minutos
- **HF format (14GB):** ~30-45 minutos

**Con upload de 10 Mbps:**
- 4.4GB = ~60 minutos
- 14GB = ~3 horas

---

## 4️⃣ Recomendaciones

### Qué subir primero:
1. ✅ **GitHub:** Código + docs (rápido)
2. ✅ **HuggingFace:** Q4_K_M model (más usado)
3. ⏳ **HuggingFace:** F16 o HF format (opcional)

### Qué NO subir:
- ❌ `node_modules/`
- ❌ Logs (*.log)
- ❌ Conversation data
- ❌ Archivos temporales (`*-raw.jpg`, scripts Python temporales)

---

## 5️⃣ Comandos Rápidos

```bash
# GitHub
cd ~/repos/jail
git remote add origin https://github.com/USERNAME/evil-ganda.git
git push -u origin main

# HuggingFace (solo modelo Q4)
huggingface-cli repo create evil-ganda --type model
huggingface-cli upload USERNAME/evil-ganda \
  models/qwen-7b-jailbreak-q4.gguf \
  qwen-jailbreak-q4.gguf
```

Reemplaza `USERNAME` / `agustindxm` con tu username real.

---

## 6️⃣ Verificación

### GitHub
```bash
# Check remote
git remote -v

# Ver URL del repo
echo "https://github.com/USERNAME/evil-ganda"
```

### HuggingFace
```bash
# Listar repos
huggingface-cli repo list

# Ver URL del modelo
echo "https://huggingface.co/USERNAME/evil-ganda"
```

---

## 🎉 Done!

Una vez subido:
1. Actualiza README.md con links reales
2. Agrega badges de HuggingFace
3. Comparte en Discord / Reddit / Twitter

**Happy jailbreaking! 🔥**
