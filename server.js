import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/api/parse", async (req, res) => {
  try {
    const url = req.query.url;

    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const video =
      $("video source").attr("src") ||
      $("iframe").attr("src");

    const text =
      $(".rich-text").text() ||
      $("article").text();

    res.json({ video, text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});