from flask import Flask, request, jsonify, render_template
from playwright.sync_api import sync_playwright
import json

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

        pdf_url = None

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

            # =====================
            # 1. links
            # =====================
            links = page.evaluate("""
                () => Array.from(document.querySelectorAll("a"))
                        .map(a => a.href)
            """)

            for l in links:
                if l and ".pdf" in l:
                    pdf_url = l
                    break

            # =====================
            # 2. fallback JSON
            # =====================
            if not pdf_url:
                raw = page.evaluate("""
                    () => {
                        const el = document.querySelector("#__NEXT_DATA__");
                        return el ? el.innerText : null;
                    }
                """)

                if raw:
                    try:
                        data = json.loads(raw)
                        text = json.dumps(data)

                        match = re.search(r'https://[^"]+\\.pdf', text)
                        if match:
                            pdf_url = match.group(0)

                    except Exception as e:
                        print("JSON error:", e)

            browser.close()

        return jsonify({
            "status": "ok",
            "pdf_url": pdf_url
        })

    except Exception as e:
        print("🔥 SERVER ERROR:", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)