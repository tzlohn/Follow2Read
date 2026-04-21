// =====================================
// 🌍 DW Learning Tool (Render Full Version)
// Backend: Node.js + Express
// Frontend: Vanilla JS
// =====================================

// =========================
// 📁 server.js (Render Backend)
// =========================

import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// 🔥 Parse DW page
app.get("/api/parse", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    // 🎬 Video extraction (iframe preferred)
    const iframeSrc = $("iframe").attr("src") || null;
    const videoSrc = $("video source").attr("src") || null;

    // 📄 Text extraction (DW structure fallback)
    let text = $(".rich-text").text();
    if (!text) text = $("article").text();

    // cleanup
    text = text.replace(/\s+/g, " ").trim();

    res.json({
      iframeSrc,
      videoSrc,
      text
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});