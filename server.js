const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Erlaube Frontend-Kommunikation und JSON
app.use(cors());
app.use(express.json());

// Zeigt deine Website aus dem "public" Ordner an
app.use(express.static('public'));

app.post('/check', async (req, res) => {
    try {
        const { number } = req.body;
        
        // Macht aus "+49 1567 8332333" -> "4915678332333" für die API
        const cleanNum = number.replace(/\D/g, ''); 

        const url = `https://xzc-corporation.biz.id/lrp?number=${cleanNum}`;
        const headers = {
            'accept-encoding': 'gzip',
            'content-type': 'application/json',
            'host': 'xzc-corporation.biz.id',
            'neckhurt': 'hate4jew',
            'user-agent': 'Dart/3.12 (dart:io)'
        };

        // API Abfrage an deinen Server
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        // Antwort in JSON umwandeln
        const data = await response.json();
        
        // Das Ergebnis zurück an deine index.html schicken
        res.json(data);

    } catch (error) {
        console.error("API Fehler:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
