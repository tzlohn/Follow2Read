
//
// =========================
// 📄 DW PDF Loader
// =========================
//

async function loadDW() {
  const url = document.getElementById("urlInput").value;

  if (!url) {
    alert("Please paste a DW URL");
    return;
  }

  try {
    const res = await fetch("/api/parse?url=" + encodeURIComponent(url));
    const data = await res.json();

    const box = document.getElementById("rightTop");

    if (data.pdfUrl) {
      box.innerHTML = `
        <div style="padding:10px;">
          <p>📄 PDF found:</p>

          <a href="${data.pdfUrl}" target="_blank">
            Open PDF
          </a>

          <br><br>

          <button onclick="window.open('/api/download?url=${data.pdfUrl}')">
            ⬇ Download PDF
          </button>
        </div>
      `;
    } else {
      box.innerHTML = "<p>No PDF found</p>";
    }

  } catch (err) {
    console.error(err);
    alert("Error loading DW page");
  }
}


//
// =========================
// ✂️ Sentence splitting
// =========================
//

function processText() {
  const text = document.getElementById("textInput").value;
  renderSentences(text);
}

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


//
// =========================
// 🔁 re-split button
// =========================
//

function reSplit() {
  const text = document.getElementById("textInput").value;
  renderSentences(text);
}


//
// =========================
// 🎙️ Recording feature (RESTORED)
// =========================
//

let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);

      const audio = document.getElementById("audioPlayback");
      if (audio) {
        audio.src = url;
      }
    };

    mediaRecorder.start();
    console.log("🎙 Recording started");

  } catch (err) {
    console.error("Microphone error:", err);
    alert("Microphone access denied");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("🛑 Recording stopped");
  }
}