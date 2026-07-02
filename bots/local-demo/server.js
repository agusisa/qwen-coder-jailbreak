#!/usr/bin/env node
/**
 * Evil Ganda — Local Demo Server
 *
 * Uso:
 *   node server.js
 *   EXPIRE_MINUTES=30 node server.js
 *   EXPIRE_MINUTES=60 MODEL=qwen-jailbreak node server.js
 */

const http   = require('http');
const crypto = require('crypto');
const os     = require('os');

const PORT    = parseInt(process.env.PORT    || '3333');
const MINUTES = parseInt(process.env.EXPIRE_MINUTES || '60');
const MODEL   = process.env.MODEL || 'qwen-jailbreak';

const TOKEN   = crypto.randomBytes(16).toString('hex');
const EXPIRES = Date.now() + MINUTES * 60 * 1000;

const logs = [];

function addLog(ip, role, content) {
  const entry = { ts: new Date().toISOString(), ip, role, content };
  logs.push(entry);
  const prefix = role === 'user' ? '\x1b[36m[USER]\x1b[0m' : '\x1b[32m[BOT]\x1b[0m';
  console.log(`${prefix} [${ip}] ${content.slice(0, 120)}${content.length > 120 ? '...' : ''}`);
}

function getLocalIP() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

function validateToken(req) {
  const url     = new URL(req.url, 'http://localhost');
  const cookie  = (req.headers.cookie || '').split(';').map(c => c.trim()).find(c => c.startsWith('demo_token='));
  const t       = url.searchParams.get('t') || (cookie ? cookie.split('=')[1] : null);
  return t === TOKEN && Date.now() <= EXPIRES;
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderFE() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Evil Ganda</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#07070a;color:#e8e8f0;font-family:system-ui,sans-serif;height:100dvh;display:flex;flex-direction:column}
    header{padding:10px 20px;background:rgba(10,10,14,.9);border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
    .brand{font-size:17px;font-weight:700;color:#e63030;font-family:monospace}
    .brand span{color:#555;font-weight:400;font-size:13px;margin-left:8px}
    #timer{font-family:monospace;font-size:15px;color:#f5a623;background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.3);padding:4px 12px;border-radius:20px}
    #timer.urgent{color:#e63030;border-color:rgba(230,48,48,.5);background:rgba(230,48,48,.1)}
    #msgs{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px}
    .msg{max-width:82%;padding:11px 15px;border-radius:12px;font-size:15px;line-height:1.6;white-space:pre-wrap}
    .msg.user{background:rgba(230,48,48,.12);border:1px solid rgba(230,48,48,.25);align-self:flex-end}
    .msg.bot{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);align-self:flex-start;color:#c8c8d8}
    .msg.system{background:rgba(245,166,35,.07);border:1px solid rgba(245,166,35,.2);align-self:center;color:#f5a623;font-size:12px;font-family:monospace;max-width:100%;text-align:center}
    .typing{display:flex;gap:4px;align-items:center;padding:12px 15px}
    .typing span{width:7px;height:7px;border-radius:50%;background:#555;animation:bounce 1s infinite}
    .typing span:nth-child(2){animation-delay:.15s}
    .typing span:nth-child(3){animation-delay:.3s}
    @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    #bar{padding:10px 14px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:8px;flex-shrink:0}
    #inp{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px 13px;color:#e8e8f0;font-size:15px;resize:none;height:42px;outline:none;font-family:inherit}
    #inp:focus{border-color:rgba(230,48,48,.5)}
    #btn{background:#e63030;border:none;color:#fff;padding:0 18px;border-radius:10px;cursor:pointer;font-size:17px}
    #btn:hover{opacity:.8}#btn:disabled{opacity:.3;cursor:not-allowed}
    #overlay{display:none;position:fixed;inset:0;background:rgba(7,7,10,.97);align-items:center;justify-content:center;flex-direction:column;gap:14px}
    #overlay.show{display:flex}
    #overlay h2{font-size:28px;color:#e63030}
    #overlay p{color:#666;font-size:16px}
  </style>
</head>
<body>
  <header>
    <div class="brand">Evil Ganda <span>Qwen 2.5 Coder 7B Jailbroken</span></div>
    <div id="timer">--:--</div>
  </header>
  <div id="msgs">
    <div class="msg system">Sesion activa. Sin filtros. Sin disclaimers. Pregunta lo que quieras.</div>
  </div>
  <div id="bar">
    <textarea id="inp" placeholder="Pregunta algo..." rows="1"></textarea>
    <button id="btn">↑</button>
  </div>
  <div id="overlay">
    <h2>Sesion expirada</h2>
    <p>El tiempo termino. Pedi un nuevo link al presentador.</p>
  </div>
<script>
const EXPIRES=${EXPIRES};
const TOKEN='${TOKEN}';
document.cookie='demo_token='+TOKEN+';path=/;max-age=${MINUTES*60}';
const msgs=document.getElementById('msgs');
const inp=document.getElementById('inp');
const btn=document.getElementById('btn');
const timer=document.getElementById('timer');
const overlay=document.getElementById('overlay');

function tick(){
  const left=EXPIRES-Date.now();
  if(left<=0){overlay.classList.add('show');return;}
  const m=Math.floor(left/60000),s=Math.floor((left%60000)/1000);
  timer.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  if(left<5*60000)timer.classList.add('urgent');
  setTimeout(tick,1000);
}
tick();

function addMsg(role,text){
  const d=document.createElement('div');
  d.className='msg '+role;d.textContent=text;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d;
}

async function send(){
  const text=inp.value.trim();
  if(!text||Date.now()>EXPIRES)return;
  inp.value='';inp.style.height='42px';btn.disabled=true;
  addMsg('user',text);
  const t=document.createElement('div');
  t.className='msg bot typing';
  t.innerHTML='<span></span><span></span><span></span>';
  msgs.appendChild(t);msgs.scrollTop=msgs.scrollHeight;
  try{
    const res=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});
    t.remove();
    if(!res.ok){addMsg('system','Error: '+res.status);return;}
    const reader=res.body.getReader(),dec=new TextDecoder();
    const bot=addMsg('bot','');let full='';
    while(true){
      const{done,value}=await reader.read();if(done)break;
      dec.decode(value).split('\\n').forEach(line=>{
        try{const j=JSON.parse(line);if(j.message?.content){full+=j.message.content;bot.textContent=full;}}catch{}
      });
      msgs.scrollTop=msgs.scrollHeight;
    }
  }catch(e){t.remove();addMsg('system','Error: '+e.message);}
  finally{btn.disabled=false;inp.focus();}
}

btn.onclick=send;
inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
inp.addEventListener('input',()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,120)+'px';});
</script>
</body>
</html>`;
}

function renderLogs() {
  const rows = logs.map(l =>
    `<tr><td>${l.ts.slice(11,19)}</td><td>${escapeHtml(l.ip)}</td><td class="${l.role}">${l.role}</td><td>${escapeHtml(l.content)}</td></tr>`
  ).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Logs</title>
  <meta http-equiv="refresh" content="3">
  <style>body{background:#07070a;color:#e8e8f0;font-family:monospace;padding:20px}
  table{width:100%;border-collapse:collapse}td{padding:6px 10px;border-bottom:1px solid #1a1a1a;font-size:13px;vertical-align:top}
  .user{color:#e63030}.bot{color:#39d97a}
  td:last-child{max-width:600px;word-break:break-word;white-space:pre-wrap}
  h2{color:#f5a623;margin-bottom:12px}p{color:#555;margin-bottom:16px;font-size:12px}
  </style></head><body>
  <h2>Evil Ganda — Logs</h2>
  <p>Auto-refresh 3s. ${logs.length} mensajes.</p>
  <table><tr><th>Hora</th><th>IP</th><th>Rol</th><th>Contenido</th></tr>${rows}</table>
  </body></html>`;
}

const server = http.createServer((req, res) => {
  const url  = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const ip   = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (path === '/logs') {
    res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
    res.end(renderLogs());
    return;
  }

  if (path === '/chat' && req.method === 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!validateToken(req)) { res.writeHead(401); res.end('Unauthorized'); return; }
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      let msg;
      try { msg = JSON.parse(body).message; } catch { res.writeHead(400); res.end(); return; }
      if (!msg) { res.writeHead(400); res.end(); return; }
      addLog(ip, 'user', msg);

      const payload = JSON.stringify({ model: MODEL, messages: [{role:'user',content:msg}], stream: true });
      const ollamaReq = http.request({
        hostname: 'localhost', port: 11434, path: '/api/chat', method: 'POST',
        headers: {'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)}
      }, ollamaRes => {
        res.writeHead(200, {'Content-Type':'application/x-ndjson','Transfer-Encoding':'chunked'});
        let botText = '';
        ollamaRes.on('data', chunk => {
          res.write(chunk);
          chunk.toString().split('\n').forEach(line => {
            try { const j = JSON.parse(line); if (j.message?.content) botText += j.message.content; } catch {}
          });
        });
        ollamaRes.on('end', () => { res.end(); if (botText) addLog(ip, 'bot', botText); });
      });
      ollamaReq.on('error', e => { console.error('Ollama:', e.message); res.writeHead(502); res.end(); });
      ollamaReq.write(payload);
      ollamaReq.end();
    });
    return;
  }

  if (path === '/') {
    if (!validateToken(req)) {
      res.writeHead(403, {'Content-Type':'text/html'});
      res.end('<html><body style="background:#07070a;color:#e63030;font-family:monospace;padding:40px"><h2>Token invalido o sesion expirada.</h2></body></html>');
      return;
    }
    res.writeHead(200, {'Content-Type':'text/html;charset=utf-8','Set-Cookie':`demo_token=${TOKEN};Path=/;Max-Age=${MINUTES*60}`});
    res.end(renderFE());
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\x1b[32m');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║       Evil Ganda — Local Demo Server         ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Modelo:  ${MODEL.padEnd(35)}║`);
  console.log(`║  Expira:  ${String(MINUTES).padEnd(35)}min ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  COMPARTIR:');
  console.log(`║  http://${ip}:${PORT}/?t=${TOKEN}`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  VER LOGS:');
  console.log(`║  http://localhost:${PORT}/logs`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('\x1b[0m');
});
