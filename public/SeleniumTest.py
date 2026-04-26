from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

URL = "https://learngerman.dw.com/de/06042026-kurz-und-leicht-video-nachrichten-zum-deutschlernen/a-76679751"

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

try:
    driver.get(URL)

    wait = WebDriverWait(driver, 20)

    # ✅ 等 React 基本載入
    wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
    time.sleep(3)

    # 🔥 scroll trigger lazy load
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(3)

    # =========================
    # 1️⃣ Title（多 fallback）
    # =========================
    title = None
    selectors = ["h1", "h2", "title"]

    for sel in selectors:
        try:
            el = driver.find_element(By.TAG_NAME, sel)
            if el.text.strip():
                title = el.text
                break
        except:
            pass

    print("\n📌 TITLE:")
    print(title)

    # =========================
    # 2️⃣ iframe video
    # =========================
    print("\n🎬 IFRAME SOURCES:")

    WebDriverWait(driver, 10).until(
        lambda d: len(d.find_elements(By.TAG_NAME, "iframe")) > 0
    )

    iframes = driver.find_elements(By.TAG_NAME, "iframe")

    for i, f in enumerate(iframes):
        print(i + 1, f.get_attribute("src"))

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
                    print(href)

    # =========================
    # 4️⃣ JSON fallback（關鍵🔥）
    # =========================
    print("\n📦 TRY NEXT_DATA JSON:")

    try:
        script = driver.find_element(By.ID, "__NEXT_DATA__").get_attribute("innerHTML")
        data = json.loads(script)

        # 印出結構（你可以再細挖）
        print("Keys:", data.keys())

    except:
        print("No __NEXT_DATA__ found")

finally:
    driver.quit()