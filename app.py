from flask import Flask, request, jsonify, render_template
import urllib.request
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import time

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/get_dom", methods=["POST"])
def get_dom():
    #url = "https://learngerman.dw.com/de/06042026-kurz-und-leicht-video-nachrichten-zum-deutschlernen/a-76679751"
    url = request.json.get("url")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(url, timeout=60000)

        # ❗關鍵：等真正內容，不是 networkidle
        try:
            page.wait_for_selector("h1", timeout=15000)
        except:
            print("⚠️ h1 not found, continue anyway")

        # 🔥 多次 scroll（DW 很吃這個）
        for _ in range(3):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(2000)

        # =========================
        # 3️⃣ Links
        # =========================

        links = page.evaluate("""
            () => Array.from(document.querySelectorAll("a"))
                    .map(a => a.href)
                    .filter(h => h && h.includes("dw.com"))
        """)

        seen = set()
        for l in links:
            if ".pdf" in l:
               print(l)
               return jsonify({
                   "status": "ok",
                   "html": "",
                   "pdf_url": l
               })

if __name__ == "__main__":
    #get_dom()
    app.run(host="0.0.0.0", port=10000)