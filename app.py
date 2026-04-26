from flask import Flask, request, jsonify, render_template
from playwright.sync_api import sync_playwright
import json

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/get_dom", methods=["POST"])
def get_dom():
    url = request.json.get("url")

    if not url:
        return jsonify({"status": "error", "message": "No URL provided"}), 400

    pdf_url = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(url, timeout=60000)

        try:
            page.wait_for_selector("h1", timeout=15000)
        except:
            pass

        # scroll
        for _ in range(3):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(2000)

        # =========================
        # 1️⃣ 抓 <a> 裡的 PDF
        # =========================
        links = page.evaluate("""
            () => Array.from(document.querySelectorAll("a"))
                    .map(a => a.href)
        """)

        for l in links:
            if l and ".pdf" in l:
                pdf_url = l
                break

        # =========================
        # 2️⃣ fallback：__NEXT_DATA__
        # =========================
        if not pdf_url:
            try:
                data = page.evaluate("""
                    () => {
                        let el = document.querySelector("#__NEXT_DATA__");
                        return el ? el.innerText : null;
                    }
                """)

                if data:
                    data = json.loads(data)

                    # 🔥 DW 常藏在這裡
                    text = json.dumps(data)
                    import re
                    match = re.search(r'https://[^"]+\\.pdf', text)
                    if match:
                        pdf_url = match.group(0)

            except Exception as e:
                print("JSON parse error:", e)

        browser.close()

    # =========================
    # ✅ 統一回傳
    # =========================
    return jsonify({
        "status": "ok",
        "pdf_url": pdf_url  # 可能是 None
    })