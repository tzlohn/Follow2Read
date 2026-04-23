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

  } catch (err) {   // ✅ 注意這裡
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
