import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

/**
 * =========================
 * Home Serve main page
 * =========================
 */
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "templates", "index.html");
  console.log("Serving:", filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Error loading page");
    }
  });
});

/**
 * =========================
 * PDF Serve PDF files
 * =========================
 */
app.get("/pdfs/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "pdfs", filename);

  console.log("Serving PDF:", filePath);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error serving PDF:", err);
        res.status(500).send("Error loading PDF");
      }
    });
  } else {
    console.error("PDF not found:", filePath);
    res.status(404).json({ error: "PDF not found" });
  }
});

/**
 * =========================
 * Server start
 * =========================
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});