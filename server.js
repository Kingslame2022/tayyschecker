require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
// Stellt die index.html aus dem Unterordner "public" bereit
app.use(express.static('public'));

const BANCHECK_KEY = process.env.BANCHECK_API_KEY;

app.post('/check', async (req, res) => {
  const { number } = req.body || {};
  if (!number) return res.status(400).json({ error: 'Nummer fehlt' });

  try {
      const bcRes = await fetch('https://baron0.com/api/v2/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BANCHECK_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number }),
      });
      
      const body = await bcRes.json();
      res.status(bcRes.status).json(body);
  } catch (error) {
      console.error("Fehler im Backend:", error);
      res.status(500).json({ error: 'Serverfehler bei der API-Abfrage' });
  }
});

app.listen(3000, () => console.log('Server läuft auf http://localhost:3000'));