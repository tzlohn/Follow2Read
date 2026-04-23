function loadVideo() {
  const url = document.getElementById("urlInput").value;

  const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&]+)/);

  if (!videoIdMatch) {
    alert("Invalid YouTube URL");
    return;
  }

  const videoId = videoIdMatch[1];

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  console.log("Embed URL:", embedUrl);

  document.getElementById("player").src = embedUrl;
}


function processText() {
  const text = document.getElementById("textInput").value;
  renderSentences(text);
}

// ✂️ 核心斷句函式
function renderSentences(text) {
  const container = document.getElementById("sentences");
  container.innerHTML = "";

  const sentences = text
    .replace(/\n/g, " ")
    .split(/(?<=[.!?])\s+/);

  sentences.forEach((s) => {
    const div = document.createElement("div");
    div.className = "sentence";
    div.innerText = s;
    container.appendChild(div);
  });
}

// 🔁 重新斷句（按鈕用）
function reSplit() {
  const text = document.getElementById("textInput").value;
  console.log("Resplitting...");
  renderSentences(text);
}
