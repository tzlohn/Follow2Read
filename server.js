const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 靜態檔案
app.use(express.static(__dirname));

// API: 列出 mp3
app.get('/list-mp3', (req, res) => {
  const audioDir = path.join(__dirname, 'audio');

  fs.readdir(audioDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Cannot read folder' });
    }

    const mp3Files = files.filter(file => file.endsWith('.mp3'));
    res.json(mp3Files);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});