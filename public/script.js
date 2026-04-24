async function loadDW() {
  const url = document.getElementById("urlInput").value;

  if (!url) {
    alert("Please paste a DW URL");
    return;
  }

  try {
    const res = await fetch(
      "/api/parse?url=" + encodeURIComponent(url)
    );

    const data = await res.json();

    console.log("PDF link:", data.pdfLink);

    const displayArea = document.getElementById("rightTop");

    if (data.pdfLink) {
      // 👉 在右上方顯示可點擊連結
      displayArea.innerHTML = `
        <div style="padding:20px;">
          <p><strong>PDF Link:</strong></p>
          <a href="${data.pdfLink}" target="_blank">
            ${data.pdfLink}
          </a>
        </div>
      `;
    } else {
      displayArea.innerHTML = `
        <div style="padding:20px;">
          <p>No PDF found for this page.</p>
        </div>
      `;
    }

  } catch (err) {
    console.error(err);
    alert("Error fetching PDF.");
  }
}


// 🎙 錄音功能
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    document.getElementById("audioPlayback").src = url;
  };

  mediaRecorder.start();
}

function stopRecording() {
  mediaRecorder.stop();
}
