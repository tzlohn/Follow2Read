from playwright.sync_api import sync_playwright
import json

URL = "https://learngerman.dw.com/de/06042026-kurz-und-leicht-video-nachrichten-zum-deutschlernen/a-76679751"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    page.goto(URL, timeout=60000)

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
    # 1️⃣ Title（更穩）
    # =========================
    print("\n📌 TITLE:")

    title = page.evaluate("""
        () => {
            let el = document.querySelector("h1") || 
                     document.querySelector("h2") || 
                     document.title;
            return el ? el.innerText || el : null;
        }
    """)

    print(title)

    # =========================
    # 3️⃣ Links（JS 抓比較穩）
    # =========================
    print("\n🔗 LINKS:")

    links = page.evaluate("""
        () => Array.from(document.querySelectorAll("a"))
                  .map(a => a.href)
                  .filter(h => h && h.includes("dw.com"))
    """)

    seen = set()
    for l in links:
        if l not in seen:
            seen.add(l)
            print("-", l)

    # =========================
    # 4️⃣ JSON（最關鍵🔥）
    # =========================


    data = page.evaluate("""
        () => {
            let el = document.querySelector("#__NEXT_DATA__");
            return el ? el.innerText : null;
        }
    """)

    if data:
        data = json.loads(data)
        print("✅ JSON keys:", data.keys())

        # 👉 你真正要的資料通常在這裡
        try:
            props = data["props"]["pageProps"]
            print("✅ pageProps keys:", props.keys())
        except:
            print("⚠️ pageProps not found")

    else:
        print("❌ No __NEXT_DATA__ found")

    browser.close()