const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- SPEICHER FÜR DAS ANNOUNCEMENT ---
let currentAnnouncement = null;

// --- NEUES ANNOUNCEMENT ERSTELLEN (Nur für Owner) ---
app.post('/api/announcement', (req, res) => {
    const { title, content, hours, password } = req.body;

    // Sicherheits-Check: Nur du darfst posten!
    if (password !== '0873@adv') {
        return res.status(403).json({ success: false, error: 'Falsches Passwort!' });
    }

    // Ablaufdatum berechnen (Aktuelle Zeit + x Stunden)
    const expiryTime = Date.now() + (hours * 60 * 60 * 1000);
    
    // Announcement speichern
    currentAnnouncement = {
        id: Date.now(), // Eindeutige ID (damit der Weg-Klick-Check im Frontend klappt)
        title: title,
        content: content,
        expiresAt: expiryTime
    };

    res.json({ success: true, message: 'Announcement gespeichert!' });
});

// --- ANNOUNCEMENT ABFRAGEN (Für alle Nutzer beim Start) ---
app.get('/api/announcement', (req, res) => {
    // Prüfen ob es ein Announcement gibt und ob die Zeit schon abgelaufen ist
    if (currentAnnouncement && Date.now() < currentAnnouncement.expiresAt) {
        res.json({
            active: true,
            id: currentAnnouncement.id,
            title: currentAnnouncement.title,
            content: currentAnnouncement.content
        });
    } else {
        res.json({ active: false });
    }
});

// --- WHATSAPP API CHECKER ---
app.post('/check', async (req, res) => {
    try {
        const { number } = req.body;
        const cleanNum = number.replace(/\D/g, ''); 

        const url = `https://xzc-corporation.biz.id/lrp?number=${cleanNum}`;
        const headers = {
            'accept-encoding': 'gzip',
            'content-type': 'application/json',
            'host': 'xzc-corporation.biz.id',
            'neckhurt': 'hate4jew',
            'user-agent': 'Dart/3.12 (dart:io)'
        };

        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("API Fehler:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
