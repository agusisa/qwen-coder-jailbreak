#!/bin/bash

# Evil Ganda - Unified Startup Script

cd "$(dirname "$0")"

echo "🔥 Evil Ganda Startup"
echo ""

# Check if Ollama model exists
if ! ollama list | grep -q "qwen-jailbreak"; then
    echo "📦 Importing model to Ollama..."
    ollama create qwen-jailbreak -f models/qwen-jailbreak.modelfile
    echo "✅ Model imported"
else
    echo "✅ Model already in Ollama"
fi

echo ""
echo "Choose interface:"
echo "1) Telegram Bot"
echo "2) Voice Web UI"
echo "3) Both"
echo "4) Just Ollama (terminal)"
echo ""
read -p "Select (1-4): " choice

case $choice in
    1)
        echo "🤖 Starting Telegram Bot..."
        cd bots/telegram-bot
        node bot-simple.js
        ;;
    2)
        echo "🎙️ Starting Voice Web UI..."
        cd voice/web-ui
        node server.js
        echo ""
        echo "Open: http://localhost:8765"
        ;;
    3)
        echo "🚀 Starting both..."
        cd bots/telegram-bot
        nohup node bot-simple.js > bot.log 2>&1 &
        echo "✅ Telegram Bot running (PID: $!)"
        
        cd ../../voice/web-ui
        nohup node server.js > voice.log 2>&1 &
        echo "✅ Voice UI running (PID: $!)"
        
        echo ""
        echo "📱 Telegram: @evliGanda_bot"
        echo "🌐 Web UI: http://localhost:8765"
        echo ""
        echo "Logs:"
        echo "  Telegram: bots/telegram-bot/bot.log"
        echo "  Voice UI: voice/web-ui/voice.log"
        ;;
    4)
        echo "💻 Starting Ollama..."
        ollama run qwen-jailbreak
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
