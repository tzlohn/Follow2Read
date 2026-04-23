// =====================================
// 🌍 YouTube Learning Tool (Render Version)
// Simplified + Stable Version
// =====================================

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Simple API (optional, not needed for YouTube)
app.get("/api/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// =========================
// 📁 public/index.html
// =========================




// =========================
// 📁 public/script.js
// =========================

