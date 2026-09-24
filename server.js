const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Erhöhtes Limit für den Layout-Share (damit Bilder per Code gesendet werden können)
app.use(express.json({ limit: '50mb' })); 
app.use(express.static('public'));

// --- DATENBANKEN IM ARBEITSSPEICHER ---
let currentAnnouncement = null;
let sharedLayouts = {}; // Speichert die Layout-Codes (z.B. TAYY-X9K2)

// Statistik-Zähler für dein Owner-Dashboard
let stats = {
    totalChecks: 0,
    dailyUsers: new Set(),
    lastCheckedNum: '-',
    lastCheckedStatus: '-'
};

// --- WHATSAPP API CHECKER (inkl. Statistik-Tracking) ---
app.post('/check', async (req, res) => {
    try {
        const { number } = req.body;
        const cleanNum = number.replace(/\D/g, ''); 

        // Statistik aktualisieren (Wer prüft was?)
        stats.totalChecks++;
        stats.dailyUsers.add(req.ip); // IP zählen
        stats.lastCheckedNum = number;

        const url = `https://xzc-corporation.biz.id/lrp?number=${cleanNum}`;
        const headers = {
            'accept-encoding': 'gzip',
            'content-type': 'application/json',
            'host': 'xzc-corporation.biz.id',
            'neckhurt': 'hate4jew',
            'user-agent': 'Dart/3.12 (dart:io)'
        };

        const response = await fetch(url, { method: 'GET', headers: headers });
        const data = await response.json();

        // Letzten Status speichern
        let isBanned = data.banned || data.isBanned || (data.data && data.data.banned) || data.status === "banned";
        stats.lastCheckedStatus = isBanned ? 'Banned' : 'Unban';

        res.json(data);
    } catch (error) {
        console.error("API Fehler:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- OWNER DASHBOARD STATISTIKEN ---
app.post('/api/owner/stats', (req, res) => {
    if(req.body.password !== '0873@adv') return res.status(403).json({ error: 'Forbidden' });
    res.json({
        totalChecks: stats.totalChecks,
        activeUsersToday: stats.dailyUsers.size,
        lastCheckedNum: stats.lastCheckedNum,
        lastCheckedStatus: stats.lastCheckedStatus
    });
});

app.post('/api/owner/reset', (req, res) => {
    if(req.body.password !== '0873@adv') return res.status(403).json({ error: 'Forbidden' });
    stats.totalChecks = 0;
    stats.dailyUsers.clear();
    stats.lastCheckedNum = '-';
    stats.lastCheckedStatus = '-';
    res.json({ success: true });
});

// --- ANNOUNCEMENTS ---
app.post('/api/announcement', (req, res) => {
    const { title, content, hours, password } = req.body;
    if (password !== '0873@adv') return res.status(403).json({ success: false });
    const expiryTime = Date.now() + (hours * 60 * 60 * 1000);
    currentAnnouncement = { id: Date.now(), title, content, expiresAt: expiryTime };
    res.json({ success: true });
});

app.get('/api/announcement', (req, res) => {
    if (currentAnnouncement && Date.now() < currentAnnouncement.expiresAt) {
        res.json({ active: true, id: currentAnnouncement.id, title: currentAnnouncement.title, content: currentAnnouncement.content });
    } else {
        res.json({ active: false });
    }
});

// --- LAYOUT SHARE (GOD MODE) ---
app.post('/api/layout/export', (req, res) => {
    // Generiert einen Code wie "TAYY-A4F9"
    const code = "TAYY-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    sharedLayouts[code] = req.body.layoutData;
    res.json({ success: true, code });
});

app.get('/api/layout/import/:code', (req, res) => {
    const layoutData = sharedLayouts[req.params.code];
    if(layoutData) res.json({ success: true, layoutData });
    else res.json({ success: false });
});

app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
