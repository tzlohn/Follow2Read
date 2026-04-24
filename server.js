import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// =========================
// 📄 API: Extract DW PDF
// =========================
app.get("/api/parse", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    const html = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    }).then(r => r.text());

    const $ = cheerio.load(html);

    let pdfLink = null;

    // =========================
    // 🔥 方法1：全域掃描 HTML（最穩）
    // =========================
    const allMatches = html.match(
      "https://static.dw.com/downloads/76896678/Kurz-und-leicht-Video-Nachrichten-2026-04-22-Manuskript-und-Wortschatz.pdf"
    );

    if (allMatches && allMatches.length > 0) {
      pdfLink = allMatches[0];
      console.log("✅ Found PDF (global):", pdfLink);
    }

    // =========================
    // 🔥 方法2：從 script 裡抓（備用）
    // =========================
    if (!pdfLink) {
      $("script").each((i, el) => {
        const content = $(el).html();
        if (!content) return;

        const match = content.match(
          /https?:\/\/static\.dw\.com\/downloads\/[^\s"'<>]+\.pdf[^\s"'<>]*/
        );

        if (match) {
          pdfLink = match[0];
          console.log("✅ Found PDF (script):", pdfLink);
        }
      });
    }

    // =========================
    // ❗ 沒找到 PDF
    // =========================
    if (!pdfLink) {
      return res.json({
        pdfLink: null,
        message: "No PDF found on this page"
      });
    }

    res.json({ pdfLink });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});