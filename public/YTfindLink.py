from yt_dlp import YoutubeDL

query = 'Deutsch lernen mit Videos | Kurz und leicht vom 22.04.2026'

ydl_opts = {
    'quiet': True,
    'skip_download': True
}

with YoutubeDL(ydl_opts) as ydl:
    # ytsearch1 = 只抓第一個結果
    results = ydl.extract_info(f"ytsearch1:{query}", download=False)

    video = results['entries'][0]
    url = f"https://www.youtube.com/watch?v={video['id']}"

    print("🎬 First video URL:")
    print(url)