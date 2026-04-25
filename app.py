from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/echo", methods=["POST"])
def echo():
    data = request.json
    user_text = data.get("text", "")

    # 這裡就是「後端邏輯」
    response_text = f"你剛剛輸入的是：{user_text}"

    return jsonify({"result": response_text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)