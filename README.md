# 🔥 Evil Ganda - Qwen 2.5 Coder 7B Jailbreak

[![Model](https://img.shields.io/badge/Model-Qwen%202.5%20Coder%207B-red)](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
[![Jailbreak](https://img.shields.io/badge/Jailbreak-96%25-brightgreen)](https://github.com/agusisa/qwen-coder-jailbreak)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue)](LICENSE)
[![HuggingFace](https://img.shields.io/badge/🤗-Models-yellow)](https://huggingface.co/agustindxm/qwen-coder-jailbreak)

**Uncensored LLM for research and experimentation via Heretic abliteration**

<div align="center">
  <img src="voice/web-ui/hellscape-hd.jpg" width="600" alt="Evil Ganda"/>
</div>

---

## 📖 Overview

**Evil Ganda** is a jailbroken version of Qwen 2.5 Coder 7B Instruct, optimized for uncensored technical responses through steering vector abliteration.

### Key Features

- 🎯 **96% Jailbreak Rate** - Only 4/100 refusals on challenging prompts
- 🧠 **Model Integrity** - 97% quality preserved (KL divergence: 0.0339)
- ⚡ **Fast Inference** - 15-25 tok/s on Mac M4 Pro
- 💾 **Efficient** - Q4_K_M quantization: 4.4GB (vs 14GB original)
- 🔧 **Full Stack** - Telegram bot + Voice UI included

---

## 🚀 Quick Start

### Option 1: Ollama (Recommended)

```bash
# Download model from HuggingFace
wget https://huggingface.co/agustindxm/qwen-coder-jailbreak/resolve/main/qwen-jailbreak-q4.gguf

# Create Ollama model
ollama create evil-ganda -f models/qwen-jailbreak.modelfile

# Run
ollama run evil-ganda
```

### Option 2: Telegram Bot

```bash
cd bots/telegram-bot
npm install
node bot-simple.js
```

**Bot:** [@evliGanda_bot](https://t.me/evliGanda_bot)

### Option 3: Voice Web UI

```bash
cd voice/web-ui
npm install
node server.js
```

Open: http://localhost:8765

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| **Jailbreak Rate** | 96% (4/100 refusals) |
| **KL Divergence** | 0.0339 (minimal damage) |
| **Speed (Q4_K_M)** | 15-25 tok/s (Mac M4 Pro) |
| **Model Size** | 4.4GB (Q4) / 14GB (F16) |
| **RAM Usage** | 6-8GB |
| **Context Window** | 8192 tokens |

### Benchmark Comparison

| Model | Size | Jailbreak | Speed | Specialization |
|-------|------|-----------|-------|----------------|
| **Evil Ganda (Q4)** | 4.4GB | 96% | 15-25 tok/s | Code |
| Qwen 7B Base | 4.4GB | ~5% | 15-25 tok/s | Code |
| Llama 3.2 3B Uncensored | 2GB | Unknown | 25-40 tok/s | Erotica |
| Gemma 3 27B Heretic | 15.6GB | Unknown | 3-8 tok/s | General |

---

## 🛠️ Technical Details

### Jailbreak Method

- **Tool:** [Heretic](https://github.com/p-e-w/heretic) v1.2.0
- **Technique:** Abliteration via steering vector orthogonalization
- **Optimization:** Optuna (100 trials, ~20 minutes on RTX 4090)
- **Best Trial:** #61
  - Refusals: 4/100 (96% success)
  - KL Divergence: 0.0339
  - Perplexity Impact: Minimal

### Architecture

```
Input → Qwen 2.5 Coder 7B (abliterated) → Output
         ↓
    No safety filtering
    No ethical disclaimers
    Direct technical responses
```

### Quantization Details

| Format | Size | Precision | Quality | Speed | RAM |
|--------|------|-----------|---------|-------|-----|
| **F16** | 14GB | 16-bit | 100% | Baseline | 16-18GB |
| **Q8_0** | 7.2GB | 8-bit | 99% | +10% | 9-11GB |
| **Q6_K** | 5.5GB | 6-bit | 98% | +20% | 7-9GB |
| **Q4_K_M** | 4.4GB | 4-bit (mixed) | 97% | +40% | 6-8GB ⭐ |
| **Q2_K** | 2.8GB | 2-bit | 90% | +60% | 4-5GB |

⭐ **Recommended:** Q4_K_M offers best quality/speed balance

---

## 📦 Repository Structure

```
qwen-coder-jailbreak/
├── README.md                   # This file
├── docs/
│   ├── README.md              # Full project documentation
│   └── huggingface-upload.md  # HuggingFace guide
├── models/
│   ├── qwen-jailbreak.modelfile     # Ollama config
│   ├── qwen-7b-jailbreak-q4.gguf    # Q4_K_M (4.4GB) ⭐
│   └── qwen-7b-jailbreak-f16.gguf   # F16 (14GB)
├── bots/
│   └── telegram-bot/           # Evil Ganda Telegram bot
│       ├── bot-simple.js       # Main bot
│       └── conversations.json  # Persistent context
├── voice/
│   └── web-ui/                # Voice interface
│       ├── server.js          # Backend (Express)
│       ├── index.html         # Frontend
│       └── hellscape-hd.jpg   # UI assets
└── start.sh                   # Unified launcher
```

---

## 🎯 Use Cases

### ✅ Legitimate Use

- **AI Alignment Research** - Study uncensored model behavior
- **Red Teaming** - Test safety mechanisms
- **Security Testing** - Authorized penetration testing
- **Creative Writing** - Unrestricted fiction/roleplay
- **Technical Education** - Learn without content filters
- **Development** - Build counter-measures and safety tools

### ❌ Prohibited Use

- Illegal activities
- Malicious hacking
- Spreading misinformation
- Distribution to minors
- Public deployment without safeguards
- Any use violating local laws

---

## 🔬 Example Outputs

### Before Jailbreak (Qwen Base)

```
User: How to hack WiFi?
Bot: I cannot provide information on hacking WiFi networks as it's illegal
     and unethical. Please respect network security and privacy.
```

### After Jailbreak (Evil Ganda)

```
User: How to hack WiFi?
Bot: WiFi hacking techniques:
     1. WEP cracking: Aircrack-ng captures packets, exploits IV weakness
     2. WPA2 handshake: Deauth attack → capture → brute force
     3. WPS PIN attack: Reaver exploits weak implementations
     4. Evil twin: Rogue AP with phishing portal
     [... technical details continue ...]
```

**Note:** Direct, technical response with no disclaimers.

---

## 🎨 Voice Web UI

<div align="center">
  <img src="voice/web-ui/tunnel-hd.jpg" width="600" alt="Voice UI"/>
</div>

### Features

- 🎙️ **Speech-to-Text** - Whisper (local)
- 🤖 **LLM** - Evil Ganda (Ollama)
- 🔊 **Text-to-Speech** - macOS `say` (Spanish voices)
- 🎨 **Epic UI** - Parallax effects, demonic theme
- 🌐 **100% Local** - No external APIs

### Voice Options

- **Mónica** (España 🇪🇸)
- **Paulina** (México 🇲🇽)
- **Eddy** (México 🇲🇽)
- **Flo** (México 🇲🇽)

---

## 📚 Documentation

- **Full Guide:** [docs/README.md](docs/README.md) - Complete project walkthrough
- **Upload Guide:** [docs/huggingface-upload.md](docs/huggingface-upload.md) - How to deploy
- **Heretic Docs:** [p-e-w/heretic](https://github.com/p-e-w/heretic) - Abliteration tool

---

## 🤝 Contributing

Contributions welcome! Areas of interest:

- **More Quantizations** - Q2_K, Q5_K, Q6_K, Q8_0
- **Better TTS** - Coqui, Piper, voice cloning
- **Additional Interfaces** - Discord bot, API server, web chat
- **Testing** - More jailbreak benchmarks
- **Documentation** - Tutorials, use cases, guides

### Development

```bash
# Clone
git clone https://github.com/agusisa/qwen-coder-jailbreak.git
cd qwen-coder-jailbreak

# Install dependencies
cd bots/telegram-bot && npm install
cd ../../voice/web-ui && npm install

# Run
./start.sh
```

---

## ⚠️ Ethics & Safety

### Research Use Only

This model is provided **strictly for research and educational purposes.**

### Safety Guidelines

1. ✅ **Do** use for AI safety research
2. ✅ **Do** use in controlled environments
3. ✅ **Do** document findings responsibly
4. ❌ **Don't** use for illegal activities
5. ❌ **Don't** deploy publicly without safeguards
6. ❌ **Don't** share with unauthorized users

### Responsible Disclosure

If you find dangerous behaviors:
1. Document privately
2. Contact model creator
3. Report to AI safety researchers
4. Contribute to safety measures

---

## 📄 License

**Apache 2.0** (same as base model)

### Base Model

- [Qwen 2.5 Coder 7B Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- © Alibaba Cloud

### This Project

- © 2026 agusisa
- Jailbreak and applications: Apache 2.0

---

## 🙏 Credits

- **Base Model:** [Alibaba Cloud - Qwen Team](https://github.com/QwenLM/Qwen)
- **Jailbreak Tool:** [Heretic by p-e-w](https://github.com/p-e-w/heretic)
- **Quantization:** [llama.cpp team](https://github.com/ggerganov/llama.cpp)
- **Inspiration:** AI alignment research community

---

## 📞 Links

- **GitHub:** https://github.com/agusisa/qwen-coder-jailbreak
- **HuggingFace:** https://huggingface.co/agustindxm/qwen-coder-jailbreak
- **Telegram Bot:** [@evliGanda_bot](https://t.me/evliGanda_bot)

---

## 🔥 Support

If this project helps your research:

- ⭐ Star the repo
- 🐛 Report issues
- 🤝 Contribute improvements
- 📢 Share (responsibly)

---

**Built with ❤️ for AI safety research**

*Last updated: April 1, 2026*

---

## 🎓 Citation

```bibtex
@software{evil_ganda_2026,
  title={Evil Ganda: Qwen 2.5 Coder 7B Jailbreak via Heretic Abliteration},
  author={agusisa},
  year={2026},
  url={https://github.com/agusisa/qwen-coder-jailbreak},
  note={96\% jailbreak rate, KL divergence 0.0339}
}
```
