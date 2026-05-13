from flask import Flask, request, jsonify, render_template, send_file
from playwright.sync_api import sync_playwright
import requests
import re
import os
import uuid
import io
from pydub import AudioSegment

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/list_dw", methods=["GET"])
def list_dw():
    try:
        url = "https://learngerman.dw.com/de/kurz-und-leicht/s-69137519"

        results = []

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"]
            )

            page = browser.new_page()
            page.goto(url, timeout=60000)

            page.wait_for_timeout(5000)

            items = page.evaluate("""
                () => Array.from(document.querySelectorAll("a"))
                    .map(a => a.href)
                    .filter(h => h && h.includes("kurz-und-leicht"))
            """)

            browser.close()

        for i in items:
            match = re.search(r'/(\d{8})-', i)

            if match:
                raw = match.group(1)
                date = f"{raw[:2]}.{raw[2:4]}.{raw[4:]}"

                results.append({
                    "date": date,
                    "url": i
                })

        return jsonify(results)

    except Exception as e:
        print("🔥 ERROR in list_dw:", str(e))
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

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
        print(f"YouTube search URL: {search_url}")
        res = requests.get(search_url, headers=headers)
        print(f"YouTube search response status: {res.status_code}")

        video_url = None

        matches = re.findall(r"watch\?v=(\S{11})", res.text)
        print(f"YouTube video ID matches found: {len(matches)}")
        if matches:
            video_id = matches[0]
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            print(f"Selected video URL: {video_url}")
        else:
            print("No YouTube video IDs found in search results")

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

@app.route('/api/convert_audio', methods=['POST'])
def convert_audio():
    try:
        # Get the uploaded audio file from the browser
        audio_file = request.files['audio']

        # Save WebM temporarily for conversion
        temp_filename = f"temp_{uuid.uuid4()}.webm"
        audio_file.save(temp_filename)

        # Convert to MP3 in memory
        audio = AudioSegment.from_file(temp_filename, format="webm")
        mp3_io = io.BytesIO()
        audio.export(mp3_io, format="mp3", bitrate="192k")
        mp3_io.seek(0)

        # Remove temporary WebM file
        os.remove(temp_filename)

        return send_file(
            mp3_io,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="recording.mp3"
        )

    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    list_dw()
    app.run(host="0.0.0.0", port=10000)