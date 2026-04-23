// =====================================
// 🌍 DW Learning Tool (Stable Parser Version)
// Backend: Node.js + Express (Render-ready)
// =====================================

import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// =====================================
// 🔥 Stable DW Parser
// =====================================

app.get("/api/parse", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    const idMatch = url.match(/a-(\\d+)/);

    if (idMatch) {
      const id = idMatch[1];

      const iframeSrc = `https://www.dw.com/en/media-center/embed/${id}`;

      console.log("✅ Using DW embed:", iframeSrc);

      return res.json({
        iframeSrc,
        videoSrc: null,
        text: ""
      });
    }
    
    const html = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    }).then(r => r.text());

    const $ = cheerio.load(html);
    const nextData = $("#__NEXT_DATA__").html();

    if (nextData) {
      const json = JSON.parse(nextData);

      console.log("Found NEXT_DATA");

      // 👉 嘗試抓內容
      const pageData = json.props?.pageProps;

      // 🔍 找文字
      let text = JSON.stringify(pageData);

      // 🔍 找影片
      let videoMatch = text.match(/https?:\/\/[^\"']+\.mp4/);

      let videoSrc = videoMatch ? videoMatch[0] : null;

      res.json({
        iframeSrc: null,
        videoSrc,
        text
      });

      return;
    }
    let iframeSrc = null;
    let videoSrc = null;

    // =========================
    // 1️⃣ Try iframe
    // =========================
    iframeSrc = $("iframe").attr("src") || null;

    // =========================
    // 2️⃣ Try video tag
    // =========================
    videoSrc = $("video source").attr("src") || null;

    // =========================
    // 3️⃣ Try JSON inside script
    // =========================
    if (!iframeSrc && !videoSrc) {
      $("script").each((i, el) => {
        const content = $(el).html();

        if (!content) return;

        // mp4 direct
        let match = content.match(/https?:\/\/[^"']+\.mp4/);
        if (match && !videoSrc) {
          videoSrc = match[0];
          console.log("✅ Found MP4:", videoSrc);
        }

        // HLS stream (.m3u8)
        match = content.match(/https?:\/\/[^"']+\.m3u8/);
        if (match && !videoSrc) {
          videoSrc = match[0];
          console.log("✅ Found HLS:", videoSrc);
        }

        // embed URL
        match = content.match(/https?:\/\/[^"']+embed[^"']+/);
        if (match && !iframeSrc) {
          iframeSrc = match[0];
          console.log("✅ Found embed:", iframeSrc);
        }
      });
    }

    // =========================
    // 4️⃣ Normalize iframe URL
    // =========================
    if (iframeSrc && iframeSrc.startsWith("/")) {
      iframeSrc = "https://learngerman.dw.com" + iframeSrc;
    }

    // =========================
    // 5️⃣ Extract text (robust)
    // =========================
    let text = "";

    const candidates = [
      ".rich-text",
      "article",
      "main",
      "body"
    ];

    for (const sel of candidates) {
      text = $(sel).text();
      if (text && text.length > 200) break;
    }

    text = text.replace(/\s+/g, " ").trim();

    console.log("📄 Text length:", text.length);

    res.json({
      iframeSrc,
      videoSrc,
      text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// =====================================
// ✅ What improved:
// - Added User-Agent (bypass DW blocking)
// - Multi-layer video detection (iframe + mp4 + m3u8 + embed)
// - Robust text extraction fallback
// - Handles relative URLs
// =====================================
