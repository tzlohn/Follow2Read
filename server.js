import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

/**
 * =========================
 * 🎯 API: Parse DW page
 * =========================
 */
app.get("/api/parse", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    // =========================================================
    // 🔥 方法1：全域 regex 掃 static.dw.com PDF
    // =========================================================
    const globalMatch = html.match(

      /https:\/\/static\.dw\.com\/downloads\/(\d+)\/.*?(\d{4}-\d{2}-\d{2}).*?\.pdf/g
    );

    if (globalMatch && globalMatch.length > 0) {
      pdfLink = globalMatch[0];
      console.log("✅ PDF found (global scan):", pdfLink);
    }

    // =========================================================
    // 🔥 方法2：script fallback
    // =========================================================
    if (!pdfLink) {
      $("script").each((i, el) => {
        const content = $(el).html();
        if (!content) return;

        const match = content.match(
          /https?:\/\/static\.dw\.com\/downloads\/[^\s"'<>]+\.pdf[^\s"'<>]*/
        );

        if (match) {
          pdfLink = match[0];
          console.log("✅ PDF found (script):", pdfLink);
        }
      });
    }

    // =========================================================
    // ❌ 沒找到 PDF
    // =========================================================
    if (!pdfLink) {
      return res.json({
        pdfLink: null,
        message: "No PDF found"
      });
    }

    // =========================================================
    // ✅ 回傳結果
    // =========================================================
    return res.json({
      pdfLink,
      source: "html"
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * =========================
 * 🚀 Server start
 * =========================
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});