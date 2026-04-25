from flask import Flask, render_template, request, send_file
import requests
import io

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/download_html", methods=["POST"])
def download_html():
    data = request.json
    url = data.get("url")

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()

        # 把 HTML 存到記憶體（不用真的寫檔案）
        file_stream = io.BytesIO()
        file_stream.write(res.text.encode("utf-8"))
        file_stream.seek(0)

        return send_file(
            file_stream,
            mimetype="text/plain",
            as_attachment=True,
            download_name="page_source.txt"
        )

    except Exception as e:
        return {"error": str(e)}, 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)