import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

/**
 * =========================
 * 🎯 API: 解析 DW 並找 PDF
 * =========================
 */
app.get("/api/parse", async (req, res) => {
  try {
    const dwUrl = req.query.url;

    if (!dwUrl) {
      return res.status(400).json({ error: "Missing URL" });
    }

    // 1️⃣ 抓 DW HTML
    const { data: html } = await axios.get(dwUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    // 2️⃣ cheerio 解析
    const $ = cheerio.load(html);

    let pdfUrl = null;

    // =====================================================
    // 🔥 核心方法：從 <a href> 找 PDF（你提供的邏輯）
    // =====================================================
    $("a").each((i, el) => {
      const href = $(el).attr("href");

      if (href && href.includes(".pdf")) {
        pdfUrl = href.startsWith("http")
          ? href
          : "https://static.dw.com" + href;
      }
    });

    // =====================================================
    // 🔥 fallback：script 裡找 PDF
    // =====================================================
    if (!pdfUrl) {
      const scriptMatches = html.match(
        /https?:\/\/static\.dw\.com\/downloads\/[^\s"'<>]+\.pdf[^\s"'<>]*/g
      );

      if (scriptMatches && scriptMatches.length > 0) {
        pdfUrl = scriptMatches[0];
      }
    }

    // =====================================================
    // ❌ 沒找到 PDF
    // =====================================================
    if (!pdfUrl) {
      return res.json({
        pdfUrl: null,
        message: "No PDF found"
      });
    }

    // =====================================================
    // ✅ 回傳給前端（重點）
    // =====================================================
    return res.json({
      pdfUrl
    });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});


/**
 * =========================
 * 📥 （可選）直接下載 PDF
 * =========================
 */
app.get("/api/download", async (req, res) => {
  try {
    const pdfUrl = req.query.url;

    if (!pdfUrl) {
      return res.status(400).json({ error: "Missing PDF URL" });
    }

    const response = await axios({
      url: pdfUrl,
      method: "GET",
      responseType: "stream"
    });

    const fileName = path.basename(pdfUrl.split("?")[0]);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    response.data.pipe(res);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * =========================
 * 🏠 Serve main page
 * =========================
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

/**
 * =========================
 * � Serve PDF files
 * =========================
 */
app.get("/pdfs/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "pdfs", filename);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "PDF not found" });
  }
});

/**
 * =========================
 * �🚀 Server start
 * =========================
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});