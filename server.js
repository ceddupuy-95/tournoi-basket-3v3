const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Persistance JSON simple (compatible tous hébergeurs) ──────────────────────
const DB_FILE = process.env.DB_PATH || path.join(__dirname, 'data.json');

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch(_) {}
  return { data: {}, updatedAt: 0 };
}

function writeDB(data, updatedAt) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ data, updatedAt }), 'utf8');
}

// ── SSE ───────────────────────────────────────────────────────────────────────
const clients = new Set();

function broadcast(updatedAt) {
  const msg = `data: ${updatedAt}\n\n`;
  for (const res of clients) {
    try { res.write(msg); } catch (_) { clients.delete(res); }
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '4mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── API ───────────────────────────────────────────────────────────────────────
app.get('/api/state', (req, res) => {
  const db = readDB();
  res.json(db);
});

app.post('/api/state', (req, res) => {
  const { data, updatedAt } = req.body;
  if (!data || typeof updatedAt !== 'number') {
    return res.status(400).json({ error: 'data et updatedAt requis' });
  }
  const current = readDB();
  if (updatedAt < current.updatedAt) {
    return res.status(409).json({ error: 'conflit', serverUpdatedAt: current.updatedAt });
  }
  writeDB(data, updatedAt);
  broadcast(updatedAt);
  res.json({ ok: true, updatedAt });
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const { updatedAt } = readDB();
  res.write(`data: ${updatedAt}\n\n`);

  clients.add(res);

  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (_) { clearInterval(ping); }
  }, 25000);

  req.on('close', () => {
    clients.delete(res);
    clearInterval(ping);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏀 BasketTournoi → http://localhost:${PORT}`);
  console.log(`   Données : ${DB_FILE}`);
});
