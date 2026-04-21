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
    let iframeSrc = $("iframe").attr("src") || null;
    let videoSrc = $("video source").attr("src") || null;

    // 🧠 嘗試從 script / JSON 抓影片
    if (!iframeSrc && !videoSrc) {
      const embed = html.match(/https?:\/\/[^\"']+embed[^\"']+/);
      if (embed) {
        iframeSrc = embed[0];
        console.log("Found embed:", iframeSrc);
      }
    }

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