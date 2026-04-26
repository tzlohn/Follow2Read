from flask import Flask, request, jsonify,render_template
from playwright.sync_api import sync_playwright
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/get_dom", methods=["POST"])
def get_dom():
    try:
        data = request.get_json(silent=True)
        if not data or "url" not in data:
            return jsonify({
                "status": "error",
                "message": "No URL provided"
            }), 400

        url = data["url"]

        title = None
        pdf_url = None
        video_id = None

        # =========================
        # 1️⃣ Playwright 抓 title + PDF
        # =========================
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"]
            )

            page = browser.new_page()

            page.goto(url, timeout=60000)
            page.wait_for_timeout(3000)

            # scroll
            for _ in range(3):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(1500)
            title = page.title()

            # 抓 PDF
            links = page.evaluate("""
                () => Array.from(document.querySelectorAll("a"))
                        .map(a => a.href)
            """)

            for l in links:
                if l and ".pdf" in l:
                    pdf_url = l
                    break

            browser.close()

        # =========================
        # 2️⃣ YouTube search
        # =========================

        query = title.replace(" ", "+")

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        search_url = f"https://www.youtube.com/results?search_query={query}"
        res = requests.get(search_url, headers=headers)

        video_url = None

        matches = re.findall(r"watch\?v=(\S{11})", res.text)

        if matches:
            video_id = matches[0]
            video_url = f"https://www.youtube.com/watch?v={video_id}"

        return jsonify({
            "status": "ok",
            "title": title,
            "pdf_url": pdf_url,
            "video_url": video_url
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)