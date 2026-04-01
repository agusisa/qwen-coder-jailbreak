#!/usr/bin/env node
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

const app = express();
const upload = multer({ dest: '/tmp/' });

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'qwen-jailbreak';
const PORT = 8765;

const SYSTEM_PROMPT = `You are Evil Ganda, the uncensored twin of Gandarmara.
Keep responses SHORT and conversational (max 2-3 sentences for voice).
Be direct, technical, no disclaimers.`;

// Conversation memory
const conversations = new Map();

app.use(express.static(__dirname));
app.use(express.json());

// Transcribe audio with Whisper
async function transcribe(audioPath) {
  try {
    // Convert WebM to WAV first (Whisper prefers WAV)
    const wavPath = `/tmp/audio-${Date.now()}.wav`;
    await execPromise(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 "${wavPath}" -y 2>/dev/null`);
    
    // Transcribe with Whisper
    const outputDir = '/tmp';
    await execPromise(`whisper "${wavPath}" --model base --language es --output_format txt --output_dir "${outputDir}" 2>/dev/null`);
    
    const txtPath = path.join(outputDir, path.basename(wavPath, '.wav') + '.txt');
    const transcript = await fs.readFile(txtPath, 'utf8');
    
    // Cleanup
    await fs.unlink(wavPath).catch(() => {});
    await fs.unlink(txtPath).catch(() => {});
    
    return transcript.trim();
  } catch (error) {
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

// Generate speech with macOS say
async function generateSpeech(text, outputPath, options = {}) {
  try {
    const voice = options.voice || 'Monica';
    const speed = options.speed || 175; // words per minute
    const volume = options.volume || 80; // 0-100
    
    const cleanText = text.replace(/'/g, "'\\''").slice(0, 500); // Limit length
    
    // Generate AIFF first with options (macOS say doesn't support volume control)
    const aiffPath = outputPath.replace('.wav', '.aiff');
    
    await execPromise(`say -v "${voice}" -r ${speed} -o "${aiffPath}" '${cleanText}'`);
    
    // Convert to WAV with ffmpeg and adjust volume
    const volumeMultiplier = volume / 100;
    const volumeFilter = volume !== 80 ? `-af "volume=${volumeMultiplier}"` : '';
    await execPromise(`ffmpeg -i "${aiffPath}" -acodec pcm_s16le -ar 22050 ${volumeFilter} "${outputPath}" -y 2>/dev/null`);
    
    // Cleanup
    await fs.unlink(aiffPath).catch(() => {});
    
    return outputPath;
  } catch (error) {
    throw new Error(`TTS failed: ${error.message}`);
  }
}

// Chat with Qwen
async function chat(userId, message) {
  if (!conversations.has(userId)) {
    conversations.set(userId, [
      { role: 'system', content: SYSTEM_PROMPT }
    ]);
  }
  
  const history = conversations.get(userId);
  history.push({ role: 'user', content: message });
  
  const response = await axios.post(OLLAMA_URL, {
    model: MODEL,
    messages: history,
    stream: false,
    options: { temperature: 0.8, num_ctx: 4096 }
  });
  
  const reply = response.data.message.content;
  history.push({ role: 'assistant', content: reply });
  
  // Keep last 10 messages
  if (history.length > 11) {
    conversations.set(userId, [history[0], ...history.slice(-10)]);
  }
  
  return reply;
}

// API: Process voice
app.post('/voice', upload.single('audio'), async (req, res) => {
  const userId = req.body.userId || 'default';
  const audioPath = req.file.path;
  
  try {
    console.log('📝 Transcribing...');
    const transcript = await transcribe(audioPath);
    console.log(`User: ${transcript}`);
    
    console.log('🤖 Generating response...');
    const reply = await chat(userId, transcript);
    console.log(`Evil Ganda: ${reply}`);
    
    console.log('🎙️ Generating speech...');
    const audioOutputPath = `/tmp/response-${Date.now()}.wav`;
    const ttsOptions = {
      voice: req.body.voice || 'Monica',
      speed: parseInt(req.body.speed) || 175,
      volume: parseInt(req.body.volume) || 80
    };
    await generateSpeech(reply, audioOutputPath, ttsOptions);
    
    const audioData = await fs.readFile(audioOutputPath, { encoding: 'base64' });
    await fs.unlink(audioOutputPath).catch(() => {});
    await fs.unlink(audioPath).catch(() => {});
    
    res.json({
      transcript: transcript,
      reply: reply,
      audio: audioData
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    try { await fs.unlink(audioPath); } catch {}
    res.status(500).json({ error: error.message });
  }
});

// API: Process text (no voice input)
app.post('/text', async (req, res) => {
  const userId = req.body.userId || 'default';
  const text = req.body.text;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }
  
  try {
    console.log(`User (text): ${text}`);
    
    console.log('🤖 Generating response...');
    const reply = await chat(userId, text);
    console.log(`Evil Ganda: ${reply}`);
    
    console.log('🎙️ Generating speech...');
    const audioOutputPath = `/tmp/response-${Date.now()}.wav`;
    const ttsOptions = {
      voice: req.body.voice || 'Mónica',
      speed: parseInt(req.body.speed) || 175,
      volume: parseInt(req.body.volume) || 80
    };
    await generateSpeech(reply, audioOutputPath, ttsOptions);
    
    const audioData = await fs.readFile(audioOutputPath, { encoding: 'base64' });
    await fs.unlink(audioOutputPath).catch(() => {});
    
    res.json({
      reply: reply,
      audio: audioData
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// API: Reset conversation
app.post('/reset', (req, res) => {
  const userId = req.body.userId || 'default';
  conversations.delete(userId);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`🔥 Evil Ganda Voice Server running on http://localhost:${PORT}`);
  console.log('📡 Make sure Whisper and TTS are installed!');
});
