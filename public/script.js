// 🌐 載入 DW 文章
async function loadDW() {
  const url = document.getElementById("urlInput").value;

  if (!url) {
    alert("Please paste a DW URL");
    return;
  }

  console.log("Fetching DW content...");

  try {
    const res = await fetch(
      window.location.origin +
      "/api/parse?url=" +
      encodeURIComponent(url)
    );

    const data = await res.json();

    console.log("API response:", data);

    if (data.text && data.text.length > 0) {
      renderText(data.text);
    } else {
      document.getElementById("rightTop").innerHTML =
        "<p>No text found.</p>";
    }

  } catch (err) {
    console.error(err);
    alert("Failed to load content");
  }
}


// 📄 顯示文字 + 斷句
function renderText(text) {
  const container = document.getElementById("rightTop");
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


// 🎙 錄音功能
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = document.getElementById("audioPlayback");
    audio.src = audioUrl;
  };

  mediaRecorder.start();
  console.log("Recording started");
}

function stopRecording() {
  mediaRecorder.stop();
  console.log("Recording stopped");
}