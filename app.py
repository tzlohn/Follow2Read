from flask import Flask, request, jsonify, render_template
from playwright.sync_api import sync_playwright
import re

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/get_dom", methods=["POST"])
def get_dom():
    url = request.json.get("url")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox"]
            )

            page = browser.new_page()

            # 👉 等 DW JS 跑完（關鍵）
            page.goto(url, wait_until="networkidle", timeout=60000)

            html = page.content()  # 🔥 F12 DOM

            browser.close()

        # 🔍 抓 PDF（DW static pattern）
        pdf_url = None

        match = re.search(r"https://static\.dw\.com/downloads/.*?\.pdf", html)
        if match:
            pdf_url = match.group(0)

        return jsonify({
            "status": "ok",
            "html": html,
            "pdf_url": pdf_url
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)