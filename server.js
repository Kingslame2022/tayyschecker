const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.static('public'));

// --- DATENBANKEN IM ARBEITSSPEICHER ---
let currentAnnouncement = null;
let sharedLayouts = {}; 

let stats = {
    totalChecks: 0,
    dailyUsers: new Set(),
    lastCheckedNum: '-',
    lastCheckedStatus: '-'
};

// --- CHAT SYSTEM LOGIK ---
let chatHistory = []; 

io.on('connection', (socket) => {
    // Sende dem neuen Nutzer den bisherigen Verlauf
    socket.emit('chatHistory', chatHistory);

    socket.on('sendMessage', (data) => {
        const isAdmin = data.adminPass === '0873@adv';
        const senderName = isAdmin ? '👑 Owner (Tayy)' : (data.name || 'User').substring(0, 15);

        const newMsg = {
            id: Date.now(),
            name: senderName,
            text: (data.text || '').substring(0, 200), 
            isAdmin: isAdmin,
            // HIER IST DER FIX: Forciert IMMER deutsche Zeit (Frankfurt/Berlin)
            time: new Date().toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' })
        };

        chatHistory.push(newMsg);
        if(chatHistory.length > 50) chatHistory.shift(); 

        io.emit('newMessage', newMsg);
    });
});


// --- WHATSAPP API CHECKER ---
app.post('/check', async (req, res) => {
    try {
        const { number } = req.body;
        const cleanNum = number.replace(/\D/g, ''); 

        stats.totalChecks++;
        stats.dailyUsers.add(req.ip || req.connection.remoteAddress); 
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

// --- LAYOUT SHARE ---
app.post('/api/layout/export', (req, res) => {
    const code = "TAYY-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    sharedLayouts[code] = req.body.layoutData;
    res.json({ success: true, code });
});

app.get('/api/layout/import/:code', (req, res) => {
    const layoutData = sharedLayouts[req.params.code];
    if(layoutData) res.json({ success: true, layoutData });
    else res.json({ success: false });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Tayy's Server läuft auf Port ${PORT} (inklusive Live-Chat)`);
});
