from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/get_pdf", methods=["POST"])
def get_pdf():
    data = request.json
    url = data.get("url")

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()

        soup = BeautifulSoup(res.text, "html.parser")

        # 方法1：找 <a> 裡的 pdf
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if ".pdf" in href.lower():
                if href.startswith("/"):
                    href = "https://static.dw.com" + href
                return jsonify({"pdf_url": href})

        # 方法2：regex 掃整頁
        match = re.search(r"https://static\.dw\.com/downloads/.*?\.pdf", res.text)
        if match:
            return jsonify({"pdf_url": match.group(0)})

        return jsonify({"error": "找不到 PDF"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)