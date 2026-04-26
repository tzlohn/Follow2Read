from flask import Flask, request, jsonify, render_template
import urllib.request
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/get_dom", methods=["POST"])
def get_dom():
    url = request.json.get("url")

    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        driver.get(url)

        wait = WebDriverWait(driver, 20)

        # ✅ 等 React 基本載入
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        time.sleep(3)

        # 🔥 scroll trigger lazy load
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)


        # =========================
        # 3️⃣ Links
        # =========================
        print("\n🔗 LINKS:")

        links = driver.find_elements(By.TAG_NAME, "a")

        seen = set()
        for l in links:
            href = l.get_attribute("href")
            if href and "dw.com" in href:
                if href not in seen:
                    seen.add(href)
                    #print("-", href)
                    if ".pdf" in href:
                        return jsonify({
                            "status": "ok",
                            "html": "",
                            "pdf_url": href
                        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        driver.quit()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)