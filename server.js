import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/api/parse", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    const html = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(r => r.text());

    const $ = cheerio.load(html);

    let pdfLink = null;

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.endsWith(".pdf")) {
        pdfLink = href;
      }
    });

    if (pdfLink && pdfLink.startsWith("/")) {
      pdfLink = "https://learngerman.dw.com" + pdfLink;
    }

    res.json({ pdfLink });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});